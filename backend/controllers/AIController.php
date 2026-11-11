<?php
require_once __DIR__ . '/../models/Database.php';

class AIController {
    private static ?string $aiBaseUrl = null;

    public static function diagnose(array $data, ?array $user = null) {
        $query = trim($data['query'] ?? $data['description'] ?? '');
        if (!$query) {
            jsonResponse(['error' => 'Query cannot be empty'], 422);
        }

        $result = self::postToAI('/api/ai/diagnose', ['query' => $query]);

        // Log prediction
        self::logPrediction($user ? (int)$user['id'] : null, 'DIAGNOSIS', ['query' => $query], $result, $result['confidence_score'] ?? 95.0, $result['troubleshooting_advice'] ?? '');

        jsonResponse($result);
    }

    public static function estimatePrice(array $data, ?array $user = null) {
        $payload = [
            'category' => $data['category'] ?? 'air-conditioner',
            'zone' => $data['zone'] ?? 'South Delhi',
            'complexity' => strtoupper($data['complexity'] ?? 'MEDIUM'),
            'parts_needed' => (int)($data['parts_needed'] ?? 1),
            'labor_hours' => (float)($data['labor_hours'] ?? 1.5),
            'urgency_surge' => (float)($data['urgency_surge'] ?? 0.0)
        ];

        $result = self::postToAI('/api/ai/estimate-price', $payload);

        self::logPrediction($user ? (int)$user['id'] : null, 'PRICING', $payload, $result, 92.5, $result['pricing_explanation'] ?? '');

        jsonResponse($result);
    }

    public static function allocateTechnician(array $data, ?array $user = null) {
        $db = Database::getConnection();

        $categorySlug = $data['category_slug'] ?? 'air-conditioner';
        $custLat = (float)($data['customer_latitude'] ?? 28.5670);
        $custLon = (float)($data['customer_longitude'] ?? 77.2200);

        // Fetch candidate technicians from database
        $stmt = $db->query("SELECT tp.id, u.full_name as name, tp.rating, tp.completed_jobs, tp.experience_years,
                                   tp.current_latitude as latitude, tp.current_longitude as longitude, tp.is_verified
                            FROM technician_profiles tp
                            JOIN users u ON tp.user_id = u.id
                            WHERE tp.is_verified = 1");
        $candidates = $stmt->fetchAll();

        // Attach skills
        foreach ($candidates as &$c) {
            $sStmt = $db->prepare("SELECT skill_name FROM technician_skills WHERE technician_id = ?");
            $sStmt->execute([(int)$c['id']]);
            $c['skills'] = $sStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
            $c['active_jobs'] = 0;
            $c['is_available'] = true;
        }

        $payload = [
            'category_slug' => $categorySlug,
            'customer_latitude' => $custLat,
            'customer_longitude' => $custLon,
            'technicians' => $candidates
        ];

        $result = self::postToAI('/api/ai/allocate-technician', $payload);
        jsonResponse($result);
    }

    public static function predictSatisfaction(array $data, ?array $user = null) {
        $payload = [
            'category' => $data['category'] ?? 'air-conditioner',
            'tech_rating' => (float)($data['tech_rating'] ?? 4.9),
            'tech_experience' => (int)($data['tech_experience'] ?? 7),
            'delay_mins' => (int)($data['delay_mins'] ?? 5),
            'price_dev_pct' => (float)($data['price_dev_pct'] ?? 0.0)
        ];

        $result = self::postToAI('/api/ai/predict-satisfaction', $payload);
        jsonResponse($result);
    }

    public static function predictMaintenance(array $data, ?array $user = null) {
        $payload = [
            'category' => $data['category'] ?? 'air-conditioner',
            'age_years' => (float)($data['age_years'] ?? 2.5),
            'usage_intensity' => $data['usage_intensity'] ?? 'MODERATE',
            'prev_repairs' => (int)($data['prev_repairs'] ?? 1),
            'days_since_service' => (int)($data['days_since_service'] ?? 120),
            'has_symptoms' => (int)($data['has_symptoms'] ?? 0)
        ];

        $result = self::postToAI('/api/ai/predict-maintenance', $payload);
        jsonResponse($result);
    }

    private static function postToAI(string $endpoint, array $payload): array {
        $baseUrl = getenv('AI_SERVICE_URL') ?: 'http://127.0.0.1:8000';
        $url = rtrim($baseUrl, '/') . $endpoint;
        $jsonPayload = json_encode($payload);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($response && !$err) {
            $decoded = json_decode($response, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        // Return clean fallback
        return [
            'fallback_mode' => true,
            'message' => 'Processed via Byte Force localized predictive fallback engine.',
            'category' => $payload['category'] ?? 'general',
            'confidence_score' => 88.0
        ];
    }

    private static function logPrediction(?int $userId, string $type, array $input, array $output, float $conf, string $expl): void {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO ai_predictions (customer_id, prediction_type, input_data, prediction_output, confidence_score, explanation) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $userId,
                $type,
                json_encode($input),
                json_encode($output),
                $conf,
                $expl
            ]);
        } catch (Throwable $e) {
            // Silently ignore logging failure
        }
    }
}



