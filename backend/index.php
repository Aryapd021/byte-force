<?php
// BYTE FORCE - RESTful API Gateway Router

require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ServiceController.php';
require_once __DIR__ . '/controllers/BookingController.php';
require_once __DIR__ . '/controllers/ApplianceController.php';
require_once __DIR__ . '/controllers/TechnicianController.php';
require_once __DIR__ . '/controllers/AIController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/PaymentController.php';

handleCORS();

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize path: strip folder prefix if served inside subdirectory
$path = preg_replace('#^/byteforce-api#', '', $requestUri);
$path = preg_replace('#^/backend#', '', $path);
$path = rtrim($path, '/');
if ($path === '' || $path === '/api') {
    jsonResponse([
        'name' => 'Byte Force - HomeGenie AI API Gateway',
        'status' => 'operational',
        'version' => '2.0.0',
        'timestamp' => date('c'),
        'database' => Database::getDriver()
    ]);
}

$input = getJsonInput();

try {
    // 1. AUTH ROUTES
    if ($method === 'POST' && $path === '/api/auth/register') {
        AuthController::register($input);
    }
    if ($method === 'POST' && $path === '/api/auth/login') {
        AuthController::login($input);
    }
    if ($method === 'GET' && $path === '/api/auth/profile') {
        $user = Auth::requireAuth();
        AuthController::profile($user);
    }

    // 2. CATEGORIES & SERVICES
    if ($method === 'GET' && $path === '/api/categories') {
        ServiceController::getCategories();
    }
    if ($method === 'GET' && $path === '/api/services') {
        ServiceController::getServices($_GET);
    }
    if ($method === 'GET' && preg_match('#^/api/services/(\d+)$#', $path, $matches)) {
        ServiceController::getServiceById((int)$matches[1]);
    }

    // 3. BOOKINGS
    if ($method === 'POST' && $path === '/api/bookings') {
        $user = Auth::requireAuth();
        BookingController::createBooking($user, $input);
    }
    if ($method === 'GET' && $path === '/api/bookings') {
        $user = Auth::requireAuth();
        BookingController::getBookings($user);
    }
    if ($method === 'GET' && preg_match('#^/api/bookings/(\d+)$#', $path, $matches)) {
        $user = Auth::requireAuth();
        BookingController::getBookingById((int)$matches[1], $user);
    }
    if (($method === 'PUT' || $method === 'POST') && preg_match('#^/api/bookings/(\d+)/status$#', $path, $matches)) {
        $user = Auth::requireAuth();
        BookingController::updateStatus((int)$matches[1], $user, $input['status'] ?? 'CONFIRMED', $input['notes'] ?? '');
    }
    if ($method === 'GET' && preg_match('#^/api/bookings/(\d+)/trust-report$#', $path, $matches)) {
        BookingController::getTrustReport((int)$matches[1]);
    }

    // 4. APPLIANCES (HOMECARE PASSPORT / HOME HEALTH INTELLIGENCE)
    if ($method === 'GET' && $path === '/api/appliances') {
        $user = Auth::requireAuth();
        ApplianceController::getAppliances($user);
    }
    if ($method === 'POST' && $path === '/api/appliances') {
        $user = Auth::requireAuth();
        ApplianceController::addAppliance($user, $input);
    }
    if ($method === 'GET' && preg_match('#^/api/appliances/(\d+)$#', $path, $matches)) {
        ApplianceController::getApplianceById((int)$matches[1]);
    }
    if ($method === 'POST' && preg_match('#^/api/appliances/(\d+)/maintenance$#', $path, $matches)) {
        ApplianceController::addMaintenanceRecord((int)$matches[1], $input);
    }
    if ($method === 'POST' && preg_match('#^/api/appliances/(\d+)/evaluate$#', $path, $matches)) {
        ApplianceController::evaluateHealth((int)$matches[1]);
    }

    // 5. TECHNICIAN ROUTES
    if ($method === 'GET' && $path === '/api/technicians/dashboard') {
        $user = Auth::requireRole(['technician', 'admin']);
        TechnicianController::getDashboard($user);
    }
    if ($method === 'PUT' && $path === '/api/technicians/availability') {
        $user = Auth::requireRole('technician');
        TechnicianController::updateAvailability($user, $input);
    }
    if ($method === 'POST' && preg_match('#^/api/technicians/jobs/(\d+)/evidence$#', $path, $matches)) {
        $user = Auth::requireRole('technician');
        TechnicianController::uploadEvidence((int)$matches[1], $user, $input);
    }

    // 6. AI PREDICTIVE ENGINES
    if ($method === 'POST' && $path === '/api/ai/diagnose') {
        $user = Auth::getAuthenticatedUser();
        AIController::diagnose($input, $user);
    }
    if ($method === 'POST' && $path === '/api/ai/estimate-price') {
        $user = Auth::getAuthenticatedUser();
        AIController::estimatePrice($input, $user);
    }
    if ($method === 'POST' && $path === '/api/ai/allocate-technician') {
        $user = Auth::getAuthenticatedUser();
        AIController::allocateTechnician($input, $user);
    }
    if ($method === 'POST' && $path === '/api/ai/predict-satisfaction') {
        $user = Auth::getAuthenticatedUser();
        AIController::predictSatisfaction($input, $user);
    }
    if ($method === 'POST' && $path === '/api/ai/predict-maintenance') {
        $user = Auth::getAuthenticatedUser();
        AIController::predictMaintenance($input, $user);
    }

    // 7. PAYMENTS & REVIEWS
    if ($method === 'POST' && $path === '/api/payments/process') {
        $user = Auth::requireAuth();
        PaymentController::processPayment($user, $input);
    }
    if ($method === 'POST' && $path === '/api/reviews') {
        $user = Auth::requireAuth();
        ReviewController::submitReview($user, $input);
    }

    // 8. NOTIFICATIONS
    if ($method === 'GET' && $path === '/api/notifications') {
        $user = Auth::requireAuth();
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 10");
        $stmt->execute([$user['id']]);
        jsonResponse(['notifications' => $stmt->fetchAll()]);
    }

    // 9. ADMIN ROUTES
    if ($method === 'GET' && $path === '/api/admin/analytics') {
        $user = Auth::requireRole('admin');
        AdminController::getAnalytics();
    }
    if ($method === 'GET' && $path === '/api/admin/users') {
        $user = Auth::requireRole('admin');
        AdminController::getUsers();
    }
    if ($method === 'GET' && $path === '/api/admin/complaints') {
        $user = Auth::requireRole('admin');
        AdminController::getComplaints();
    }
    if ($method === 'PUT' && preg_match('#^/api/admin/complaints/(\d+)$#', $path, $matches)) {
        $user = Auth::requireRole('admin');
        AdminController::updateComplaint((int)$matches[1], $input);
    }

    // 404 Route Not Found
    jsonResponse([
        'error' => "Endpoint not found: {$method} {$path}",
        'available_routes' => [
            '/api/auth/login',
            '/api/auth/register',
            '/api/categories',
            '/api/services',
            '/api/bookings',
            '/api/appliances',
            '/api/ai/diagnose',
            '/api/ai/estimate-price',
            '/api/ai/allocate-technician',
            '/api/ai/predict-satisfaction',
            '/api/ai/predict-maintenance',
            '/api/admin/analytics'
        ]
    ], 404);

} catch (Throwable $e) {
    jsonResponse([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage()
    ], 500);
}
