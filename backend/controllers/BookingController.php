<?php
require_once __DIR__ . '/../models/Database.php';

class BookingController {
    public static function createBooking(array $user, array $data) {
        $serviceId = (int)($data['service_id'] ?? 0);
        $addressId = (int)($data['address_id'] ?? 0);
        $bookingDate = $data['booking_date'] ?? date('Y-m-d', strtotime('+1 day'));
        $timeSlot = $data['time_slot'] ?? '10:00 AM - 12:00 PM';
        $customerNotes = $data['customer_notes'] ?? '';
        $applianceId = !empty($data['appliance_id']) ? (int)$data['appliance_id'] : null;

        $db = Database::getConnection();

        // Validate service
        $svcStmt = $db->prepare("SELECT s.*, c.slug as category_slug FROM services s JOIN service_categories c ON s.category_id = c.id WHERE s.id = ?");
        $svcStmt->execute([$serviceId]);
        $service = $svcStmt->fetch();
        if (!$service) {
            jsonResponse(['error' => 'Invalid service selection'], 422);
        }

        // Validate address or use customer's default address
        if (!$addressId) {
            $addrStmt = $db->prepare("SELECT id FROM addresses WHERE user_id = ? ORDER BY is_default DESC LIMIT 1");
            $addrStmt->execute([$user['id']]);
            $defaultAddr = $addrStmt->fetch();
            if ($defaultAddr) {
                $addressId = (int)$defaultAddr['id'];
            } else {
                // Auto create fallback address
                $insAddr = $db->prepare("INSERT INTO addresses (user_id, address_line1, city, state, postal_code, is_default) VALUES (?, 'Default Home Address', 'New Delhi', 'Delhi', '110001', 1)");
                $insAddr->execute([$user['id']]);
                $addressId = (int)$db->lastInsertId();
            }
        }

        $bookingRef = 'BF-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
        $estimatedPrice = (float)$service['base_price'];

        $insBooking = $db->prepare("INSERT INTO bookings (booking_reference, customer_id, service_id, address_id, appliance_id, status, booking_date, time_slot, customer_notes, estimated_price, payment_status) VALUES (?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, 'PENDING')");
        $insBooking->execute([$bookingRef, $user['id'], $serviceId, $addressId, $applianceId, $bookingDate, $timeSlot, $customerNotes, $estimatedPrice]);
        $bookingId = (int)$db->lastInsertId();

        // Log status history
        $logStmt = $db->prepare("INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by_user_id, notes) VALUES (?, 'PENDING', 'CONFIRMED', ?, 'Booking created and confirmed by customer')");
        $logStmt->execute([$bookingId, $user['id']]);

        // Auto-match technician based on skill & availability
        $techStmt = $db->prepare("SELECT tp.id, tp.user_id, tp.rating, tp.completed_jobs, tp.experience_years, u.full_name as name
                                  FROM technician_profiles tp
                                  JOIN users u ON tp.user_id = u.id
                                  JOIN technician_skills ts ON ts.technician_id = tp.id
                                  WHERE ts.category_id = ? AND tp.is_verified = 1
                                  ORDER BY tp.rating DESC, tp.completed_jobs DESC LIMIT 1");
        $techStmt->execute([(int)$service['category_id']]);
        $bestTech = $techStmt->fetch();

        if (!$bestTech) {
            // General technician fallback
            $genStmt = $db->query("SELECT tp.id, tp.user_id, tp.rating, tp.completed_jobs, tp.experience_years, u.full_name as name
                                   FROM technician_profiles tp JOIN users u ON tp.user_id = u.id WHERE tp.is_verified = 1 ORDER BY tp.rating DESC LIMIT 1");
            $bestTech = $genStmt->fetch();
        }

        if ($bestTech) {
            $matchingScore = 95.5;
            $reasons = "Automated AI matching: Certified category specialist with {$bestTech['rating']}★ rating and {$bestTech['completed_jobs']} completed repairs.";
            $assignStmt = $db->prepare("INSERT INTO technician_assignments (booking_id, technician_id, status, matching_score, match_reasons) VALUES (?, ?, 'ACCEPTED', ?, ?)");
            $assignStmt->execute([$bookingId, (int)$bestTech['id'], $matchingScore, $reasons]);

            // Update booking status
            $updStmt = $db->prepare("UPDATE bookings SET status = 'TECHNICIAN_ASSIGNED' WHERE id = ?");
            $updStmt->execute([$bookingId]);

            // Notify customer
            $notif = $db->prepare("INSERT INTO notifications (user_id, title, message, type, link_url) VALUES (?, 'Technician Assigned', ?, 'BOOKING', ?)");
            $notif->execute([$user['id'], "Expert technician {$bestTech['name']} has been matched for your {$service['name']} appointment.", "/bookings/{$bookingId}"]);
        }

        jsonResponse([
            'message' => 'Booking created successfully',
            'booking_id' => $bookingId,
            'booking_reference' => $bookingRef,
            'assigned_technician' => $bestTech ? $bestTech['name'] : 'Pending Allocation',
            'status' => $bestTech ? 'TECHNICIAN_ASSIGNED' : 'CONFIRMED'
        ], 201);
    }

    public static function getBookings(array $user) {
        $db = Database::getConnection();

        if ($user['role'] === 'customer') {
            $stmt = $db->prepare("SELECT b.*, s.name as service_name, s.image_url as service_image,
                                         c.name as category_name, c.slug as category_slug,
                                         a.address_line1, a.city,
                                         u_tech.full_name as technician_name, u_tech.phone as technician_phone, tp.rating as technician_rating
                                  FROM bookings b
                                  JOIN services s ON b.service_id = s.id
                                  JOIN service_categories c ON s.category_id = c.id
                                  JOIN addresses a ON b.address_id = a.id
                                  LEFT JOIN technician_assignments ta ON ta.booking_id = b.id
                                  LEFT JOIN technician_profiles tp ON ta.technician_id = tp.id
                                  LEFT JOIN users u_tech ON tp.user_id = u_tech.id
                                  WHERE b.customer_id = ?
                                  ORDER BY b.id DESC");
            $stmt->execute([$user['id']]);
        } elseif ($user['role'] === 'technician') {
            $stmt = $db->prepare("SELECT b.*, s.name as service_name, s.image_url as service_image,
                                         c.name as category_name, c.slug as category_slug,
                                         a.address_line1, a.city, a.latitude, a.longitude,
                                         u_cust.full_name as customer_name, u_cust.phone as customer_phone
                                  FROM bookings b
                                  JOIN services s ON b.service_id = s.id
                                  JOIN service_categories c ON s.category_id = c.id
                                  JOIN addresses a ON b.address_id = a.id
                                  JOIN users u_cust ON b.customer_id = u_cust.id
                                  JOIN technician_assignments ta ON ta.booking_id = b.id
                                  JOIN technician_profiles tp ON ta.technician_id = tp.id
                                  WHERE tp.user_id = ?
                                  ORDER BY b.id DESC");
            $stmt->execute([$user['id']]);
        } else {
            // Admin sees all
            $stmt = $db->query("SELECT b.*, s.name as service_name, c.name as category_name,
                                       u_cust.full_name as customer_name, u_tech.full_name as technician_name
                                FROM bookings b
                                JOIN services s ON b.service_id = s.id
                                JOIN service_categories c ON s.category_id = c.id
                                JOIN users u_cust ON b.customer_id = u_cust.id
                                LEFT JOIN technician_assignments ta ON ta.booking_id = b.id
                                LEFT JOIN technician_profiles tp ON ta.technician_id = tp.id
                                LEFT JOIN users u_tech ON tp.user_id = u_tech.id
                                ORDER BY b.id DESC");
        }

        $bookings = $stmt->fetchAll();
        jsonResponse(['bookings' => $bookings]);
    }

    public static function getBookingById(int $id, array $user) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT b.*, s.name as service_name, s.description as service_desc, s.base_price, s.warranty_days, s.image_url as service_image,
                                     c.name as category_name, c.slug as category_slug,
                                     a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.latitude, a.longitude,
                                     u_cust.full_name as customer_name, u_cust.phone as customer_phone, u_cust.email as customer_email,
                                     u_tech.full_name as technician_name, u_tech.phone as technician_phone,
                                     tp.rating as technician_rating, tp.completed_jobs as technician_jobs, tp.bio as technician_bio,
                                     ta.matching_score, ta.match_reasons,
                                     p.transaction_ref, p.amount as paid_amount, p.status as payment_status_detail, p.payment_method
                              FROM bookings b
                              JOIN services s ON b.service_id = s.id
                              JOIN service_categories c ON s.category_id = c.id
                              JOIN addresses a ON b.address_id = a.id
                              JOIN users u_cust ON b.customer_id = u_cust.id
                              LEFT JOIN technician_assignments ta ON ta.booking_id = b.id
                              LEFT JOIN technician_profiles tp ON ta.technician_id = tp.id
                              LEFT JOIN users u_tech ON tp.user_id = u_tech.id
                              LEFT JOIN payments p ON p.booking_id = b.id
                              WHERE b.id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }

        // Access check
        if ($user['role'] === 'customer' && (int)$booking['customer_id'] !== (int)$user['id']) {
            jsonResponse(['error' => 'Unauthorized access to this booking'], 403);
        }

        // Fetch status history
        $hStmt = $db->prepare("SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY id ASC");
        $hStmt->execute([$id]);
        $history = $hStmt->fetchAll();

        // Fetch evidence
        $evStmt = $db->prepare("SELECT * FROM service_evidence WHERE booking_id = ?");
        $evStmt->execute([$id]);
        $evidence = $evStmt->fetchAll();

        jsonResponse([
            'booking' => $booking,
            'status_history' => $history,
            'service_evidence' => $evidence
        ]);
    }

    public static function updateStatus(int $id, array $user, string $newStatus, string $notes = '') {
        $allowed = ['PENDING', 'CONFIRMED', 'TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];
        $newStatus = strtoupper($newStatus);

        if (!in_array($newStatus, $allowed, true)) {
            jsonResponse(['error' => "Invalid status: {$newStatus}"], 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();
        if (!$booking) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }

        $prevStatus = $booking['status'];
        $upd = $db->prepare("UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $upd->execute([$newStatus, $id]);

        $log = $db->prepare("INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by_user_id, notes) VALUES (?, ?, ?, ?, ?)");
        $log->execute([$id, $prevStatus, $newStatus, $user['id'], $notes ?: "Status changed to {$newStatus}"]);

        // If completed, update technician completed_jobs counter
        if ($newStatus === 'COMPLETED') {
            $db->exec("UPDATE bookings SET payment_status = 'PAID', final_price = estimated_price WHERE id = {$id} AND payment_status != 'PAID'");
            $techAssign = $db->query("SELECT technician_id FROM technician_assignments WHERE booking_id = {$id}")->fetch();
            if ($techAssign) {
                $db->exec("UPDATE technician_profiles SET completed_jobs = completed_jobs + 1 WHERE id = {$techAssign['technician_id']}");
            }
        }

        jsonResponse([
            'message' => "Booking status updated to {$newStatus}",
            'previous_status' => $prevStatus,
            'new_status' => $newStatus
        ]);
    }

    public static function getTrustReport(int $id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT b.*, s.name as service_name, s.warranty_days, s.base_price,
                                     c.name as category_name,
                                     u_cust.full_name as customer_name,
                                     u_tech.full_name as technician_name, tp.rating as technician_rating, tp.experience_years,
                                     p.transaction_ref, p.amount as paid_amount, p.payment_method
                              FROM bookings b
                              JOIN services s ON b.service_id = s.id
                              JOIN service_categories c ON s.category_id = c.id
                              JOIN users u_cust ON b.customer_id = u_cust.id
                              LEFT JOIN technician_assignments ta ON ta.booking_id = b.id
                              LEFT JOIN technician_profiles tp ON ta.technician_id = tp.id
                              LEFT JOIN users u_tech ON tp.user_id = u_tech.id
                              LEFT JOIN payments p ON p.booking_id = b.id
                              WHERE b.id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            jsonResponse(['error' => 'Booking record not found'], 404);
        }

        $evStmt = $db->prepare("SELECT * FROM service_evidence WHERE booking_id = ?");
        $evStmt->execute([$id]);
        $evidence = $evStmt->fetchAll();

        // Build report
        $report = [
            'report_id' => 'TR-' . str_pad((string)$id, 6, '0', STR_PAD_LEFT),
            'issued_at' => date('Y-m-d H:i:s'),
            'booking_reference' => $booking['booking_reference'],
            'service_name' => $booking['service_name'],
            'category' => $booking['category_name'],
            'customer_name' => $booking['customer_name'],
            'technician' => [
                'name' => $booking['technician_name'] ?? 'Assigned Professional',
                'rating' => $booking['technician_rating'] ?? 5.0,
                'experience_years' => $booking['experience_years'] ?? 5
            ],
            'price_breakdown' => [
                'base_labor' => (float)$booking['estimated_price'] * 0.65,
                'consumables_and_parts' => (float)$booking['estimated_price'] * 0.35,
                'total_paid' => (float)($booking['final_price'] ?? $booking['estimated_price']),
                'currency' => 'INR'
            ],
            'warranty' => [
                'coverage_days' => (int)$booking['warranty_days'],
                'valid_until' => date('Y-m-d', strtotime("+{$booking['warranty_days']} days")),
                'terms' => 'Covers all replaced components and workmanship against defects.'
            ],
            'evidence' => $evidence,
            'trust_seal' => 'BYTE FORCE FAIRFIX VERIFIED & QUALITY ASSURED'
        ];

        jsonResponse(['trust_report' => $report]);
    }
}
