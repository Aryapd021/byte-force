<?php
require_once __DIR__ . '/../models/Database.php';

class ServiceController {
    public static function getCategories() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT id, name, slug, description, icon, display_order FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
        $categories = $stmt->fetchAll();
        jsonResponse(['categories' => $categories]);
    }

    public static function getServices(array $queryParams = []) {
        $db = Database::getConnection();
        $sql = "SELECT s.id, s.category_id, s.name, s.slug, s.description, s.base_price, 
                       s.estimated_duration_mins, s.warranty_days, s.image_url,
                       c.name as category_name, c.slug as category_slug, c.icon as category_icon
                FROM services s
                JOIN service_categories c ON s.category_id = c.id
                WHERE s.is_active = 1";
        $params = [];

        if (!empty($queryParams['category_id'])) {
            $sql .= " AND s.category_id = ?";
            $params[] = (int)$queryParams['category_id'];
        }

        if (!empty($queryParams['category'])) {
            $sql .= " AND c.slug = ?";
            $params[] = $queryParams['category'];
        }

        if (!empty($queryParams['search'])) {
            $sql .= " AND (s.name LIKE ? OR s.description LIKE ?)";
            $searchTerm = '%' . $queryParams['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($queryParams['max_price'])) {
            $sql .= " AND s.base_price <= ?";
            $params[] = (float)$queryParams['max_price'];
        }

        $sql .= " ORDER BY s.id ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $services = $stmt->fetchAll();

        jsonResponse(['services' => $services]);
    }

    public static function getServiceById(int $id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
                              FROM services s
                              JOIN service_categories c ON s.category_id = c.id
                              WHERE s.id = ?");
        $stmt->execute([$id]);
        $service = $stmt->fetch();

        if (!$service) {
            jsonResponse(['error' => 'Service not found'], 404);
        }

        // Fetch associated reviews
        $revStmt = $db->prepare("SELECT r.rating, r.review_text, r.created_at, u.full_name as customer_name
                                 FROM reviews r
                                 JOIN bookings b ON r.booking_id = b.id
                                 JOIN users u ON r.customer_id = u.id
                                 WHERE b.service_id = ?
                                 ORDER BY r.id DESC LIMIT 5");
        $revStmt->execute([$id]);
        $reviews = $revStmt->fetchAll();

        jsonResponse([
            'service' => $service,
            'recent_reviews' => $reviews
        ]);
    }
}
