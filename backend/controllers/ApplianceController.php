<?php
require_once __DIR__ . '/../models/Database.php';

class ApplianceController {
    public static function getAppliances(array $user) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
                              FROM appliances a
                              JOIN service_categories c ON a.category_id = c.id
                              WHERE a.customer_id = ?
                              ORDER BY a.health_score ASC, a.id DESC");
        $stmt->execute([$user['id']]);
        $appliances = $stmt->fetchAll();
        jsonResponse(['appliances' => $appliances]);
    }

    public static function addAppliance(array $user, array $data) {
        $name = trim($data['appliance_name'] ?? '');
        $categoryId = (int)($data['category_id'] ?? 1);
        $brand = trim($data['brand'] ?? 'Generic');
        $model = trim($data['model_number'] ?? '');
        $purchaseDate = $data['purchase_date'] ?? date('Y-m-d', strtotime('-2 years'));
        $usage = $data['usage_intensity'] ?? 'MODERATE';
        $symptoms = trim($data['reported_symptoms'] ?? '');

        if (!$name) {
            jsonResponse(['error' => 'Appliance name is required'], 422);
        }

        $db = Database::getConnection();

        // Calculate age in years
        $ageYears = round((time() - strtotime($purchaseDate)) / (365.25 * 86400), 1);
        $ageYears = max(0.2, $ageYears);

        // Fetch category slug
        $catStmt = $db->prepare("SELECT slug FROM service_categories WHERE id = ?");
        $catStmt->execute([$categoryId]);
        $cat = $catStmt->fetch();
        $categorySlug = $cat ? $cat['slug'] : 'air-conditioner';

        // Evaluate initial health using AI service
        $aiResult = self::callAIHealthService($categorySlug, $ageYears, $usage, 0, 90, !empty($symptoms) ? 1 : 0);

        $healthScore = $aiResult['health_score'] ?? 85;
        $risk = $aiResult['maintenance_risk'] ?? 'LOW';
        $recService = $aiResult['recommended_service'] ?? 'Periodic Preventative Checkup';
        $status = $aiResult['status'] ?? 'HEALTHY';

        $stmt = $db->prepare("INSERT INTO appliances (customer_id, category_id, appliance_name, brand, model_number, purchase_date, health_score, maintenance_risk, reported_symptoms, usage_intensity, recommended_service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user['id'], $categoryId, $name, $brand, $model, $purchaseDate, $healthScore, $risk, $symptoms, $usage, $recService, $status]);
        $applianceId = (int)$db->lastInsertId();

        // Log AI prediction record
        $predStmt = $db->prepare("INSERT INTO ai_predictions (customer_id, prediction_type, input_data, prediction_output, confidence_score, explanation) VALUES (?, 'MAINTENANCE_RISK', ?, ?, ?, ?)");
        $predStmt->execute([
            $user['id'],
            json_encode(['category' => $categorySlug, 'age' => $ageYears, 'usage' => $usage]),
            json_encode($aiResult),
            94.0,
            $aiResult['explanation'] ?? 'Health evaluated upon registration'
        ]);

        jsonResponse([
            'message' => 'Appliance registered to HomeCare Passport',
            'appliance_id' => $applianceId,
            'evaluation' => $aiResult
        ], 201);
    }

    public static function getApplianceById(int $id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, c.name as category_name, c.slug as category_slug
                              FROM appliances a
                              JOIN service_categories c ON a.category_id = c.id
                              WHERE a.id = ?");
        $stmt->execute([$id]);
        $appliance = $stmt->fetch();
        if (!$appliance) {
            jsonResponse(['error' => 'Appliance not found'], 404);
        }

        $hStmt = $db->prepare("SELECT * FROM appliance_maintenance_history WHERE appliance_id = ? ORDER BY maintenance_date DESC");
        $hStmt->execute([$id]);
        $history = $hStmt->fetchAll();

        jsonResponse([
            'appliance' => $appliance,
            'maintenance_history' => $history
        ]);
    }

    public static function addMaintenanceRecord(int $applianceId, array $data) {
        $db = Database::getConnection();
        $date = $data['maintenance_date'] ?? date('Y-m-d');
        $desc = trim($data['description'] ?? 'Preventive servicing performed');
        $parts = $data['parts_replaced'] ?? null;
        $cost = (float)($data['cost'] ?? 0.0);
        $notes = $data['technician_notes'] ?? '';

        $stmt = $db->prepare("INSERT INTO appliance_maintenance_history (appliance_id, maintenance_date, description, parts_replaced, cost, technician_notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$applianceId, $date, $desc, $parts, $cost, $notes]);

        // Reset appliance health back to healthy level
        $db->exec("UPDATE appliances SET health_score = 95, maintenance_risk = 'LOW', status = 'HEALTHY', last_service_date = '{$date}' WHERE id = {$applianceId}");

        jsonResponse(['message' => 'Maintenance record recorded. Appliance health score rejuvenated!']);
    }

    public static function evaluateHealth(int $id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, c.slug as category_slug FROM appliances a JOIN service_categories c ON a.category_id = c.id WHERE a.id = ?");
        $stmt->execute([$id]);
        $app = $stmt->fetch();
        if (!$app) {
            jsonResponse(['error' => 'Appliance not found'], 404);
        }

        $ageYears = round((time() - strtotime($app['purchase_date'] ?: '-2 years')) / (365.25 * 86400), 1);
        $daysSince = 150;
        if (!empty($app['last_service_date'])) {
            $daysSince = (int)((time() - strtotime($app['last_service_date'])) / 86400);
        }

        $hasSymptoms = !empty($app['reported_symptoms']) ? 1 : 0;
        $aiResult = self::callAIHealthService($app['category_slug'], $ageYears, $app['usage_intensity'], 1, $daysSince, $hasSymptoms);

        $upd = $db->prepare("UPDATE appliances SET health_score = ?, maintenance_risk = ?, status = ?, recommended_service = ? WHERE id = ?");
        $upd->execute([
            $aiResult['health_score'],
            $aiResult['maintenance_risk'],
            $aiResult['status'],
            $aiResult['recommended_service'],
            $id
        ]);

        jsonResponse([
            'appliance_id' => $id,
            'recalculated_health' => $aiResult
        ]);
    }

    private static function callAIHealthService(string $cat, float $age, string $usage, int $repairs, int $days, int $symptoms): array {
        $postData = json_encode([
            'category' => $cat,
            'age_years' => $age,
            'usage_intensity' => $usage,
            'prev_repairs' => $repairs,
            'days_since_service' => $days,
            'has_symptoms' => $symptoms
        ]);

        $ch = curl_init('http://127.0.0.1:8000/api/ai/predict-maintenance');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($response && !$err) {
            $decoded = json_decode($response, true);
            if (is_array($decoded) && isset($decoded['health_score'])) {
                return $decoded;
            }
        }

        // Deterministic fallback
        $deg = ($age * 4.5) + ($repairs * 5) + ($symptoms * 20);
        $score = max(20, min(100, round(100 - $deg)));
        $risk = $score >= 80 ? 'LOW' : ($score >= 65 ? 'MEDIUM' : ($score >= 45 ? 'HIGH' : 'CRITICAL'));
        return [
            'health_score' => (int)$score,
            'maintenance_risk' => $risk,
            'status' => $risk === 'LOW' ? 'HEALTHY' : 'NEEDS_ATTENTION',
            'recommended_service' => 'Annual Preventive Inspection',
            'explanation' => "Health estimated at {$score}/100 with {$risk} risk level."
        ];
    }
}
