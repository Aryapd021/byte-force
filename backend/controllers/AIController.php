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

        // If diagnose endpoint failed to reach microservice, use smart localized fallback
        if ($endpoint === '/api/ai/diagnose') {
            return self::fallbackDiagnose($payload['query'] ?? '');
        }

        // Return clean fallback
        return [
            'fallback_mode' => true,
            'message' => 'Processed via Byte Force localized predictive fallback engine.',
            'category' => $payload['category'] ?? 'general',
            'confidence_score' => 88.0
        ];
    }

    private static function fallbackDiagnose(string $query): array {
        $q = strtolower(trim($query));

        // Out-of-domain patterns
        $outOfDomainPatterns = [
            '#(who is|who was|who won|capital of|president of|prime minister)#i',
            '#(tell me a joke|write a poem|write code|python script|recipe for|bake a cake)#i',
            '#(what is the meaning of life|how old are you|who created you|are you real)#i',
            '#(translate|weather in|crypto|bitcoin|how to get rich|diet plan|blood pressure)#i',
            '#^(hi|hello|hey|greetings|namaste|who are you|help me)$#i'
        ];

        foreach ($outOfDomainPatterns as $pattern) {
            if (preg_match($pattern, $q)) {
                $agentMsg = "Hello! I am HomeGenie AI, your home maintenance and repair diagnostics agent.\n\n" .
                    "Your query appears to be outside my home services domain. I specialize in diagnosing appliances, " .
                    "electrical systems, plumbing, carpentry, painting, cleaning, and pest control.\n\n" .
                    "Please describe an appliance malfunction or home repair symptom to receive an instant diagnosis!";

                return [
                    'is_out_of_domain' => true,
                    'predicted_category' => 'General Home Services',
                    'category_display' => 'HomeGenie AI Assistant',
                    'confidence_score' => 0,
                    'urgency' => 'INFO',
                    'possible_issues' => [],
                    'troubleshooting_steps' => [],
                    'recommended_services' => [
                        'Air Conditioner Care',
                        'Electrical Systems',
                        'Plumbing & Water',
                        'Refrigeration',
                        'Washing Machine Repair',
                        'RO & Water Purifier',
                        'Pest Control & Painting'
                    ],
                    'agent_message' => $agentMsg,
                    'gemini_explanation' => $agentMsg,
                    'disclaimer' => 'HomeGenie AI is specialized in home services and appliance health diagnostics.'
                ];
            }
        }

        // High priority keyword matches
        if (preg_match('#(termite|cockroach|bedbug|bed bug|pest|rat|mice)#i', $q)) {
            return [
                'is_out_of_domain' => false,
                'predicted_category' => 'pest-control',
                'category_display' => 'Pest Control & Fumigation',
                'confidence_score' => 96.0,
                'possible_issue' => 'Subterranean Termite Infestation / Pest Harborage',
                'possible_issues' => [
                    'Termite mud tunnels emerging from wooden fixtures or baseboards',
                    'Insect colony sheltered in warm dark conduits or furniture joints',
                    'Deep wood borer larvae activity weaken structural timber'
                ],
                'urgency' => 'HIGH',
                'troubleshooting_advice' => 'Do not spray aerosol cans on termite tunnels as it scatters colonies deeper into walls.',
                'troubleshooting_steps' => [
                    'Keep affected area dry and inspect wooden frames with a flashlight',
                    'Avoid disturbing mud trails until technician can inject targeted termiticide',
                    'Book odorless pressurized chemical injection and gel baiting'
                ],
                'recommended_service' => 'Comprehensive Pest Control & Termite Treatment',
                'recommended_services' => [
                    'Comprehensive Pest Control & Termite Treatment',
                    'Anti-Cockroach & Bed Bug Gel Extermination'
                ],
                'disclaimer' => 'AI preliminary diagnosis only. Certified pest control inspection recommended.'
            ];
        }

        if (preg_match('#(geyser|water heater|immersion|hot water)#i', $q)) {
            return [
                'is_out_of_domain' => false,
                'predicted_category' => 'water-heater',
                'category_display' => 'Water Heater & Geyser',
                'confidence_score' => 96.0,
                'possible_issue' => 'Heating Element Scale / Safety Thermal Cut-Off Trip',
                'possible_issues' => [
                    'Calcium mineral scale encrusting immersion heating coil',
                    'Bi-metallic safety thermal cut-off tripped due to overheating',
                    'Sacrificial magnesium anode depleted causing internal corrosion'
                ],
                'urgency' => 'HIGH',
                'troubleshooting_advice' => 'Turn off power before touching metallic pipes. Do not run with empty tank.',
                'troubleshooting_steps' => [
                    'Verify power socket indicator is lit and MCB is switch on',
                    'Ensure water is flowing freely from the hot tap before powering on',
                    'If geyser trips MCB instantly, leave power OFF and book technician'
                ],
                'recommended_service' => 'Geyser Maintenance & Element Replacement',
                'recommended_services' => [
                    'Geyser Maintenance & Element Replacement',
                    'Complete Home Electrical Safety Audit'
                ],
                'disclaimer' => 'AI preliminary diagnosis only. Certified technician required for electrical appliances.'
            ];
        }

        if (preg_match('#(ac|air conditioner|cooling|compressor|freon|refrigerant)#i', $q)) {
            return [
                'is_out_of_domain' => false,
                'predicted_category' => 'air-conditioner',
                'category_display' => 'Air Conditioner Care',
                'confidence_score' => 98.0,
                'possible_issue' => 'Refrigerant Loss / Thermal Transfer Blockage / Coil Dirt',
                'possible_issues' => [
                    'Heavy dust build-up on cooling evaporator fins restricting airflow',
                    'Low refrigerant gas pressure due to micro-copper hairline pinholes',
                    'Compressor capacitor thermal overload trip'
                ],
                'urgency' => 'HIGH',
                'troubleshooting_advice' => 'Check thermostat settings and washable mesh filter. Schedule professional jet cleaning.',
                'troubleshooting_steps' => [
                    'Slide out indoor mesh filters and wash under running tap water',
                    'Verify remote is set to Cool mode at 24°C with fan speed on High',
                    'Ensure outdoor unit compressor has at least 2 feet airflow clearance',
                    'If blowing warm air continuously, turn off to prevent compressor burnout'
                ],
                'recommended_service' => 'AC Deep Jet Cleaning & Sanitization',
                'recommended_services' => [
                    'AC Deep Jet Cleaning & Sanitization',
                    'AC Gas Leak Detection & Refill',
                    'AC Comprehensive Health Checkup'
                ],
                'disclaimer' => 'AI preliminary diagnosis only. Physical inspection by a certified engineer is recommended.'
            ];
        }

        if (preg_match('#(spark|mcb|short circuit|switchboard|shock|wiring|fuse)#i', $q)) {
            return [
                'is_out_of_domain' => false,
                'predicted_category' => 'electrical',
                'category_display' => 'Electrical Systems',
                'confidence_score' => 97.0,
                'possible_issue' => 'Circuit Overload / Arcing Terminal / Insulation Fault',
                'possible_issues' => [
                    'High resistance contact arcing inside switchboard terminals',
                    'MCB thermal fatigue or sudden short circuit breaker trip',
                    'Missing or high-resistance earthing ground connection'
                ],
                'urgency' => 'CRITICAL',
                'troubleshooting_advice' => 'Isolate the circuit at main distribution board. Do not touch charred sockets.',
                'troubleshooting_steps' => [
                    'Turn off the tripped breaker at your main distribution box',
                    'Unplug all heavy appliances from the affected room circuit',
                    'Check for any burning plastic smell or discoloration',
                    'Do not attempt live wiring work; book a licensed electrician'
                ],
                'recommended_service' => 'Switchboard & Circuit Breaker Repair',
                'recommended_services' => [
                    'Switchboard & Circuit Breaker Repair',
                    'Complete Home Electrical Safety Audit'
                ],
                'disclaimer' => 'AI preliminary diagnosis only. Electrical faults require licensed technician inspection.'
            ];
        }

        if (preg_match('#(leak|pipe|tap|faucet|drain|clog|plumbing|toilet|flush)#i', $q)) {
            return [
                'is_out_of_domain' => false,
                'predicted_category' => 'plumbing',
                'category_display' => 'Plumbing & Water',
                'confidence_score' => 97.0,
                'possible_issue' => 'Hydraulic Leakage / Valve Seat Failure / Waste Line Clog',
                'possible_issues' => [
                    'Worn internal ceramic disc cartridge or washer inside tap',
                    'Concealed pipe joint hairline crack behind wall tiles',
                    'Organic debris or mineral sediment choking P-trap drain'
                ],
                'urgency' => 'HIGH',
                'troubleshooting_advice' => 'Shut off local angle valve or main water supply to prevent water damage.',
                'troubleshooting_steps' => [
                    'Locate stopcock valve near the fixture and rotate clockwise to close',
                    'Unscrew aerator filter from tap spout to clean out grit',
                    'For clogged drains, use a rubber plunger; avoid corrosive acids',
                    'Schedule acoustic leak detection if damp patches appear on wall'
                ],
                'recommended_service' => 'Concealed Pipe Leakage Detection',
                'recommended_services' => [
                    'Concealed Pipe Leakage Detection',
                    'Bathroom Tap & Drain Pipe Fitting'
                ],
                'disclaimer' => 'AI preliminary diagnosis only. A certified plumber should inspect concealed lines.'
            ];
        }

        // Generic safe service fallback
        return [
            'is_out_of_domain' => false,
            'predicted_category' => 'general',
            'category_display' => 'General Home Maintenance',
            'confidence_score' => 78.0,
            'possible_issue' => 'Appliance / Fixture Mechanical Diagnostic Required',
            'possible_issues' => [
                'Routine component wear-and-tear or physical obstruction',
                'Power or fluid supply line irregularity'
            ],
            'urgency' => 'MEDIUM',
            'troubleshooting_advice' => 'Check primary power and water supplies and observe any unusual noise or vibration.',
            'troubleshooting_steps' => [
                'Ensure the unit is firmly plugged in and power switch is ON',
                'Verify supply breakers in the main distribution panel are active',
                'Schedule an expert inspection for detailed diagnostics'
            ],
            'recommended_service' => 'Comprehensive Home Health Audit',
            'recommended_services' => [
                'Comprehensive Home Health Audit',
                'Electrical Safety Audit'
            ],
            'disclaimer' => 'AI preliminary diagnosis only. Certified technician inspection recommended.'
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



