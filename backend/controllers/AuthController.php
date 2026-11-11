<?php
require_once __DIR__ . '/../models/Database.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthController {
    public static function register(array $data) {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'customer';
        $fullName = trim($data['full_name'] ?? '');
        $phone = trim($data['phone'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'A valid email address is required'], 422);
        }
        if (strlen($password) < 6) {
            jsonResponse(['error' => 'Password must be at least 6 characters long'], 422);
        }
        if (!$fullName) {
            jsonResponse(['error' => 'Full name is required'], 422);
        }
        if (!in_array($role, ['customer', 'technician'], true)) {
            $role = 'customer';
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'An account with this email already exists'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $db->prepare("INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)");
        $insert->execute([$email, $hash, $role, $fullName, $phone]);
        $userId = (int)$db->lastInsertId();

        if ($role === 'customer') {
            $cp = $db->prepare("INSERT INTO customer_profiles (user_id, home_type) VALUES (?, ?)");
            $cp->execute([$userId, $data['home_type'] ?? 'Apartment']);

            // Create default address if provided
            if (!empty($data['address_line1'])) {
                $addr = $db->prepare("INSERT INTO addresses (user_id, address_line1, city, state, postal_code, is_default) VALUES (?, ?, ?, ?, ?, 1)");
                $addr->execute([$userId, $data['address_line1'], $data['city'] ?? 'New Delhi', $data['state'] ?? 'Delhi', $data['postal_code'] ?? '110001']);
            }
        } elseif ($role === 'technician') {
            $tp = $db->prepare("INSERT INTO technician_profiles (user_id, experience_years, bio, service_zone) VALUES (?, ?, ?, ?)");
            $tp->execute([$userId, (int)($data['experience_years'] ?? 2), $data['bio'] ?? 'Certified Service Technician', $data['service_zone'] ?? 'Central Delhi']);
        }

        $token = JWT::generate([
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'full_name' => $fullName
        ]);

        jsonResponse([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'role' => $role,
                'full_name' => $fullName,
                'phone' => $phone
            ]
        ], 201);
    }

    public static function login(array $data) {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(['error' => 'Email and password are required'], 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id, email, password_hash, role, full_name, phone, avatar_url, is_active FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(['error' => 'Invalid email or password'], 401);
        }

        if ((int)$user['is_active'] !== 1) {
            jsonResponse(['error' => 'Account is currently deactivated'], 403);
        }

        $token = JWT::generate([
            'user_id' => (int)$user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'full_name' => $user['full_name']
        ]);

        unset($user['password_hash']);

        jsonResponse([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    public static function profile(array $user) {
        $db = Database::getConnection();
        $profile = null;
        $addresses = [];

        if ($user['role'] === 'customer') {
            $stmt = $db->prepare("SELECT * FROM customer_profiles WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch();

            $addrStmt = $db->prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC");
            $addrStmt->execute([$user['id']]);
            $addresses = $addrStmt->fetchAll();
        } elseif ($user['role'] === 'technician') {
            $stmt = $db->prepare("SELECT * FROM technician_profiles WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch();
        }

        jsonResponse([
            'user' => $user,
            'profile' => $profile,
            'addresses' => $addresses
        ]);
    }
}
