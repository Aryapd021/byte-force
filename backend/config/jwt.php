<?php
// Byte Force JWT Helper - HMAC-SHA256 Token Issuer & Validator

class JWT {
    private static int $expiration = 86400 * 7; // 7 days

    private static function getSecret(): string {
        $secret = getenv('JWT_SECRET');

        if (!$secret || strlen($secret) < 32) {
            return 'byte_force_super_secret_jwt_key_2026_default_fallback_32_chars';
        }

        return $secret;
    }

    public static function generate(array $payload): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiration;
        $payloadEncoded = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payloadEncoded);

        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::getSecret(),
            true
        );

        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function verify(string $token): ?array {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$base64UrlHeader, $base64UrlPayload, $base64UrlSignature] = $parts;

        $signature = self::base64UrlDecode($base64UrlSignature);

        $expectedSignature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::getSecret(),
            true
        );

        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);

        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private static function base64UrlEncode(string $data): string {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode(string $data): string {
        $remainder = strlen($data) % 4;

        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
