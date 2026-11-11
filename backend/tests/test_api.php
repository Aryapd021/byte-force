<?php
/**
 * Byte Force - PHP Backend API Integration Test Suite
 * Validates authentication, RBAC, services catalog, booking operations,
 * appliance health passports, and AI gateway proxying.
 */

$baseUrl = "http://127.0.0.1:8080/api";
$passed = 0;
$failed = 0;

function assertTest($name, $condition, $details = "") {
    global $passed, $failed;
    if ($condition) {
        echo " [PASS] $name\n";
        $passed++;
    } else {
        echo " [FAIL] $name: $details\n";
        $failed++;
    }
}

function apiRequest($url, $method = "GET", $data = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $headers = ["Content-Type: application/json"];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === "POST") {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === "PUT") {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "code" => $httpCode,
        "data" => json_decode($response, true)
    ];
}

echo "\n=======================================================\n";
echo " BYTE FORCE REST API INTEGRATION SUITE\n";
echo "=======================================================\n\n";

// 1. Root Gateway Status
$res = apiRequest("$baseUrl");
assertTest("Gateway Health Check", $res["code"] === 200 && isset($res["data"]["status"]) && $res["data"]["status"] === "operational");

// 2. Customer Authentication
$loginRes = apiRequest("$baseUrl/auth/login", "POST", [
    "email" => "customer.rahul@gmail.com",
    "password" => "Password@123"
]);
assertTest("Customer Login", $loginRes["code"] === 200 && isset($loginRes["data"]["token"]));
$customerToken = $loginRes["data"]["token"] ?? null;

// 3. Admin Authentication
$adminLogin = apiRequest("$baseUrl/auth/login", "POST", [
    "email" => "admin@byteforce.in",
    "password" => "Admin@123"
]);
assertTest("Admin Login", $adminLogin["code"] === 200 && $adminLogin["data"]["user"]["role"] === "admin");
$adminToken = $adminLogin["data"]["token"] ?? null;

// 4. Invalid Login Rejection
$badLogin = apiRequest("$baseUrl/auth/login", "POST", [
    "email" => "customer.rahul@gmail.com",
    "password" => "WrongPassword"
]);
assertTest("Unauthorized Login Rejected", $badLogin["code"] === 401);

// 5. Service Categories
$catRes = apiRequest("$baseUrl/categories");
assertTest("Fetch Service Categories", $catRes["code"] === 200 && count($catRes["data"]["categories"] ?? $catRes["data"]) >= 6);

// 6. Services Catalog
$svcRes = apiRequest("$baseUrl/services");
assertTest("Fetch Services Catalog", $svcRes["code"] === 200 && count($svcRes["data"]["services"] ?? $svcRes["data"]) >= 10);

// 7. Customer Bookings Retrieval
$bookingsRes = apiRequest("$baseUrl/bookings", "GET", null, $customerToken);
assertTest("Customer Scoped Bookings", $bookingsRes["code"] === 200 && is_array($bookingsRes["data"]["bookings"] ?? $bookingsRes["data"]));

// 8. AI Diagnosis Proxy
$diagRes = apiRequest("$baseUrl/ai/diagnose", "POST", [
    "description" => "AC running but blowing warm air and not cooling"
], $customerToken);
assertTest("AI Diagnosis Proxying", $diagRes["code"] === 200 && (isset($diagRes["data"]["category"]) || isset($diagRes["data"]["predicted_category"])));

// 9. Customer Appliances Listing
$appRes = apiRequest("$baseUrl/appliances", "GET", null, $customerToken);
assertTest("Customer Appliances List", $appRes["code"] === 200 && is_array($appRes["data"]["appliances"] ?? $appRes["data"]));

// 10. Admin Analytics Dashboard Data
$analyticsRes = apiRequest("$baseUrl/admin/analytics", "GET", null, $adminToken);
assertTest("Admin Real-Time Database Analytics", $analyticsRes["code"] === 200 && isset($analyticsRes["data"]["total_bookings"]) || isset($analyticsRes["data"]["analytics"]["total_bookings"]));

echo "\n-------------------------------------------------------\n";
echo " TEST SUMMARY: $passed Passed, $failed Failed\n";
echo "-------------------------------------------------------\n\n";

if ($failed > 0) exit(1);
exit(0);
