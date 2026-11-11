<?php
require_once __DIR__ . '/../models/Database.php';

class PaymentController {
    public static function processPayment(array $user, array $data) {
        $bookingId = (int)($data['booking_id'] ?? 0);
        $amount = (float)($data['amount'] ?? 0.0);
        $method = strtoupper($data['payment_method'] ?? 'UPI');

        if (!$bookingId || $amount <= 0) {
            jsonResponse(['error' => 'Invalid booking or payment amount'], 422);
        }

        $db = Database::getConnection();
        $bStmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $bStmt->execute([$bookingId]);
        $booking = $bStmt->fetch();

        if (!$booking) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }

        $txnRef = 'TXN-BF-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $gatewayResponse = [
            'gateway' => 'ByteForce_Simulated_Gateway',
            'mode' => 'DEMO_SANDBOX',
            'transaction_id' => $txnRef,
            'amount' => $amount,
            'method' => $method,
            'status' => 'SUCCESS',
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $ins = $db->prepare("INSERT INTO payments (booking_id, customer_id, transaction_ref, amount, payment_method, status, payment_gateway_mode, gateway_response) VALUES (?, ?, ?, ?, ?, 'COMPLETED', 'DEMO_SANDBOX', ?)");
        $ins->execute([$bookingId, $user['id'], $txnRef, $amount, $method, json_encode($gatewayResponse)]);

        // Update booking
        $upd = $db->prepare("UPDATE bookings SET payment_status = 'PAID', final_price = ? WHERE id = ?");
        $upd->execute([$amount, $bookingId]);

        // Send payment notification
        $notif = $db->prepare("INSERT INTO notifications (user_id, title, message, type, link_url) VALUES (?, 'Payment Successful', ?, 'PAYMENT', ?)");
        $notif->execute([$user['id'], "Payment of ₹{$amount} for booking {$booking['booking_reference']} received successfully via {$method}.", "/bookings/{$bookingId}"]);

        jsonResponse([
            'message' => 'Payment processed successfully in Sandbox mode',
            'transaction_ref' => $txnRef,
            'amount' => $amount,
            'status' => 'COMPLETED'
        ], 201);
    }
}

class ReviewController {
    public static function submitReview(array $user, array $data) {
        $bookingId = (int)($data['booking_id'] ?? 0);
        $rating = (float)($data['rating'] ?? 5.0);
        $reviewText = trim($data['review_text'] ?? '');
        $cleanliness = (int)($data['cleanliness_rating'] ?? 5);
        $punctuality = (int)($data['punctuality_rating'] ?? 5);
        $quality = (int)($data['quality_rating'] ?? 5);

        if (!$bookingId || $rating < 1 || $rating > 5) {
            jsonResponse(['error' => 'Valid booking ID and rating (1-5) required'], 422);
        }

        $db = Database::getConnection();

        // Check booking
        $bStmt = $db->prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ?");
        $bStmt->execute([$bookingId, $user['id']]);
        $booking = $bStmt->fetch();
        if (!$booking) {
            jsonResponse(['error' => 'Booking not found or not owned by user'], 404);
        }

        // Get technician assignment
        $tStmt = $db->prepare("SELECT technician_id FROM technician_assignments WHERE booking_id = ?");
        $tStmt->execute([$bookingId]);
        $assign = $tStmt->fetch();
        $techId = $assign ? (int)$assign['technician_id'] : 1;

        $ins = $db->prepare("INSERT INTO reviews (booking_id, customer_id, technician_id, rating, cleanliness_rating, punctuality_rating, quality_rating, review_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([$bookingId, $user['id'], $techId, $rating, $cleanliness, $punctuality, $quality, $reviewText]);

        // Recalculate technician rating
        $avgStmt = $db->prepare("SELECT AVG(rating) as avg_r, COUNT(*) as cnt FROM reviews WHERE technician_id = ?");
        $avgStmt->execute([$techId]);
        $revData = $avgStmt->fetch();
        if ($revData) {
            $newAvg = round((float)$revData['avg_r'], 2);
            $newCnt = (int)$revData['cnt'];
            $db->exec("UPDATE technician_profiles SET rating = {$newAvg}, total_reviews = {$newCnt} WHERE id = {$techId}");
        }

        jsonResponse(['message' => 'Review and satisfaction rating submitted successfully!'], 201);
    }
}
