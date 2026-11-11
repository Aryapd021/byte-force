<?php
require_once __DIR__ . '/../models/Database.php';

class TechnicianController {
    public static function getDashboard(array $user) {
        $db = Database::getConnection();

        // Fetch technician profile
        $stmt = $db->prepare("SELECT * FROM technician_profiles WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();

        if (!$profile) {
            jsonResponse(['error' => 'Technician profile not found'], 404);
        }

        $techId = (int)$profile['id'];

        // Fetch active assigned jobs
        $jobsStmt = $db->prepare("SELECT b.*, s.name as service_name, c.name as category_name,
                                         a.address_line1, a.city, a.latitude, a.longitude,
                                         u_cust.full_name as customer_name, u_cust.phone as customer_phone,
                                         ta.matching_score, ta.status as assignment_status
                                  FROM bookings b
                                  JOIN technician_assignments ta ON ta.booking_id = b.id
                                  JOIN services s ON b.service_id = s.id
                                  JOIN service_categories c ON s.category_id = c.id
                                  JOIN addresses a ON b.address_id = a.id
                                  JOIN users u_cust ON b.customer_id = u_cust.id
                                  WHERE ta.technician_id = ?
                                  ORDER BY b.id DESC");
        $jobsStmt->execute([$techId]);
        $jobs = $jobsStmt->fetchAll();

        // Calculate earnings
        $earnStmt = $db->prepare("SELECT SUM(final_price) as total_earnings, COUNT(*) as completed_count
                                  FROM bookings b
                                  JOIN technician_assignments ta ON ta.booking_id = b.id
                                  WHERE ta.technician_id = ? AND b.status = 'COMPLETED'");
        $earnStmt->execute([$techId]);
        $earningsData = $earnStmt->fetch();

        $totalEarnings = (float)($earningsData['total_earnings'] ?? 0.0);
        $completedCount = (int)($earningsData['completed_count'] ?? 0);

        // Fetch skills
        $skillsStmt = $db->prepare("SELECT ts.skill_name, ts.proficiency_level, c.name as category_name
                                    FROM technician_skills ts
                                    JOIN service_categories c ON ts.category_id = c.id
                                    WHERE ts.technician_id = ?");
        $skillsStmt->execute([$techId]);
        $skills = $skillsStmt->fetchAll();

        jsonResponse([
            'profile' => $profile,
            'summary' => [
                'total_earnings' => $totalEarnings,
                'completed_jobs' => $completedCount,
                'active_jobs' => count(array_filter($jobs, fn($j) => in_array($j['status'], ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS']))),
                'rating' => (float)$profile['rating']
            ],
            'jobs' => $jobs,
            'skills' => $skills
        ]);
    }

    public static function updateAvailability(array $user, array $data) {
        $db = Database::getConnection();
        $isAvail = !empty($data['is_available']) ? 1 : 0;

        $stmt = $db->prepare("UPDATE technician_profiles SET is_verified = ? WHERE user_id = ?");
        $stmt->execute([$isAvail, $user['id']]);

        jsonResponse(['message' => 'Availability updated', 'is_available' => (bool)$isAvail]);
    }

    public static function uploadEvidence(int $bookingId, array $user, array $data) {
        $evidenceType = $data['evidence_type'] ?? 'AFTER_PHOTO';
        $fileUrl = $data['file_url'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500';
        $notes = $data['notes'] ?? 'Work verification photo';

        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO service_evidence (booking_id, evidence_type, file_url, notes) VALUES (?, ?, ?, ?)");
        $stmt->execute([$bookingId, $evidenceType, $fileUrl, $notes]);

        jsonResponse(['message' => 'Service evidence recorded for FairFix Trust Report'], 201);
    }
}
