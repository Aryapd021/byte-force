<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../models/Database.php';

class Auth {
    public static function getAuthenticatedUser(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];
        $payload = JWT::verify($token);
        if (!$payload || !isset($payload['user_id'])) {
            return null;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id, email, role, full_name, phone, avatar_url, is_active FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if (!$user || (int)$user['is_active'] !== 1) {
            return null;
        }

        return $user;
    }

    public static function requireAuth(): array {
        $user = self::getAuthenticatedUser();
        if (!$user) {
            jsonResponse(['error' => 'Unauthorized: Invalid or expired token'], 401);
        }
        return $user;
    }

    public static function requireRole(array|string $roles): array {
        $user = self::requireAuth();
        $roles = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'], $roles, true)) {
            jsonResponse(['error' => 'Forbidden: Insufficient privileges for ' . $user['role']], 403);
        }

        return $user;
    }
}
