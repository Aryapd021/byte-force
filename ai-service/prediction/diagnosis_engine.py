import os
import re
import joblib
import numpy as np

from prediction.gemini_engine import GeminiExplanationEngine

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "diagnosis_model.joblib")

# Comprehensive Knowledge Base covering all home service domains
DOMAIN_KNOWLEDGE = {
    "air-conditioner": {
        "display_name": "Air Conditioner & HVAC",
        "keywords": [
            "ac", "air conditioner", "split ac", "window ac", "cooling", "cool", "compressor",
            "condenser", "refrigerant", "freon", "gas leak", "chilling", "ac filter",
            "blowing warm air", "thermostat", "ac water leaking", "ac ice", "duct"
        ],
        "problem": "Refrigerant Pressure Drop / Heat Exchanger Clog / Compressor Fault",
        "possible_issues": [
            "Dust accumulation on condenser and evaporator fins blocking airflow",
            "Sub-optimal refrigerant (R32/R410A) gas pressure due to micro-leakage",
            "Compressor run-capacitor weakness or thermal overload trip"
        ],
        "urgency": "HIGH",
        "tip": "Turn off the AC unit. Do not repeatedly restart a tripping compressor. Check that indoor air filters are free of surface lint, and ensure outdoor unit has 2ft clearance.",
        "troubleshooting_steps": [
            "Inspect indoor washable air filters and clean off surface dust",
            "Verify remote thermostat mode is set to 'Cool' with fan speed on Auto/High",
            "Ensure the outdoor compressor unit is unblocked by curtains or debris",
            "If warm air or ice formation persists, avoid running to protect the compressor"
        ],
        "recommended_service": "AC Deep Jet Cleaning & Sanitization",
        "recommended_services": [
            "AC Deep Jet Cleaning & Sanitization",
            "AC Gas Leak Detection & Refill",
            "AC Comprehensive Health Checkup"
        ]
    },
    "electrical": {
        "display_name": "Electrical Systems",
        "keywords": [
            "electrical", "electric", "spark", "sparking", "mcb", "fuse", "short circuit",
            "switchboard", "socket", "wire", "wiring", "voltage", "shock", "power cut",
            "circuit breaker", "tripping", "switch", "inverter", "earthing", "burning smell",
            "phase", "fluctuation", "ceiling fan not working", "light flickering"
        ],
        "problem": "Circuit Overload / Insulation Breakdown / Arcing Loose Connection",
        "possible_issues": [
            "Phase-to-neutral short circuit or high-resistance terminal arcing",
            "Miniature Circuit Breaker (MCB) thermal fatigue or current surge trip",
            "Improper grounding/earthing causing mild tingling touch shocks"
        ],
        "urgency": "CRITICAL",
        "tip": "Immediately isolate the affected circuit via the main distribution board. Never touch blackened switchboards or frayed copper wiring.",
        "troubleshooting_steps": [
            "Locate your main Distribution Board (DB) and switch off the tripped MCB",
            "Unplug all heavy appliances (AC, microwave, iron) from the affected circuit",
            "Check for any visible scorch marks or pungent plastic burning odor",
            "Do not attempt internal wiring repairs; schedule a licensed electrician immediately"
        ],
        "recommended_service": "Switchboard & Circuit Breaker Repair",
        "recommended_services": [
            "Switchboard & Circuit Breaker Repair",
            "Complete Home Electrical Safety Audit"
        ]
    },
    "plumbing": {
        "display_name": "Plumbing & Leakage",
        "keywords": [
            "plumbing", "pipe", "leak", "leaking", "tap", "faucet", "drain", "drainage",
            "clog", "clogged", "sewer", "sink", "washbasin", "toilet", "commode", "flush",
            "cistern", "water pressure", "drip", "dripping", "shower", "p-trap", "angle valve"
        ],
        "problem": "Hydraulic Leakage / Valve Seat Deterioration / Solid Waste Pipe Blockage",
        "possible_issues": [
            "Worn-out rubber washer or ceramic cartridge inside faucet/mixer tap",
            "Concealed joint hairline fissure due to hydraulic water hammer",
            "Hair, grease, or scale accumulation in the P-trap or main drain line"
        ],
        "urgency": "HIGH",
        "tip": "Shut off the local stopcock or main water line valve to prevent water damage. Place a bucket under active leaks.",
        "troubleshooting_steps": [
            "Locate the local quarter-turn angle valve beneath the fixture and turn clockwise to close",
            "Check the aerator nozzle on the tap for mineral scale or lime buildup",
            "For clogged sinks, use a manual rubber plunger; avoid caustic chemical acids",
            "If moisture appears on walls or ceiling, schedule acoustic leak detection"
        ],
        "recommended_service": "Concealed Pipe Leakage Detection",
        "recommended_services": [
            "Concealed Pipe Leakage Detection",
            "Bathroom Tap & Drain Pipe Fitting"
        ]
    },
    "water-heater": {
        "display_name": "Water Heater & Geyser",
        "keywords": [
            "geyser", "water heater", "immersion", "hot water", "boiler", "instant geyser",
            "storage geyser", "water not heating", "geyser leaking", "geyser shock",
            "heating element", "geyser thermostat"
        ],
        "problem": "Heating Element Scale Encrustation / Thermostat Cut-Off Failure",
        "possible_issues": [
            "Heavy calcium scale insulation on copper immersion heating element",
            "Bi-metallic safety thermal cut-off tripped due to dry heating",
            "Inner tank sacrificial anode rod consumed leading to corrosive tank pinholes"
        ],
        "urgency": "HIGH",
        "tip": "Always switch off power before touching the geyser or incoming metallic pipes. Never run a geyser with empty water supply.",
        "troubleshooting_steps": [
            "Verify power supply socket has power and the indicator light turns on",
            "Ensure full water flow is emerging from the hot water outlet before powering on",
            "If geyser trips the MCB instantly upon switching on, keep it powered off (element grounded)",
            "Book a technician to descale the inner tank and inspect safety pressure valve"
        ],
        "recommended_service": "Geyser Maintenance & Element Replacement",
        "recommended_services": [
            "Geyser Maintenance & Element Replacement",
            "Complete Home Electrical Safety Audit"
        ]
    },
    "refrigerator": {
        "display_name": "Refrigeration & Cooling",
        "keywords": [
            "fridge", "refrigerator", "freezer", "not cooling", "fridge warm", "ice maker",
            "compressor humming", "defrost", "excess frost", "fridge leaking water",
            "vegetable box water", "door gasket", "double door", "inverter fridge"
        ],
        "problem": "Defrost Heater / Compressor PTC Starter Relay / Sealed Capillary Clog",
        "possible_issues": [
            "Bi-metal defrost sensor failure resulting in evaporator coil ice build-up",
            "PTC start relay malfunction preventing compressor rotor ignition",
            "Worn magnetic door gasket allowing ambient warm air infiltration"
        ],
        "urgency": "HIGH",
        "tip": "Ensure at least 4 inches clearance between refrigerator back and the wall. Keep door closed to preserve internal cooling.",
        "troubleshooting_steps": [
            "Check that refrigerator temperature dial is set to medium/normal (3-4°C)",
            "Inspect condenser coils at rear/bottom and vacuum accumulated dust bunnies",
            "Test door magnetic seal by inserting a paper currency note; it should resist pulling",
            "If back walls are covered in thick frost, perform a manual 6-hour defrost"
        ],
        "recommended_service": "Refrigerator Cooling Repair & Thermostat",
        "recommended_services": [
            "Refrigerator Cooling Repair & Thermostat",
            "Compressor Relay & Gas Charging"
        ]
    },
    "washing-machine": {
        "display_name": "Washing Machine & Laundry",
        "keywords": [
            "washing machine", "washer", "dryer", "spin", "spinning", "drum", "loud noise",
            "vibration", "rattling", "water not draining", "drum not turning", "front load",
            "top load", "agitator", "inlet error", "drain pump", "door locked"
        ],
        "problem": "Suspension Damper Wear / Drain Pump Impeller Obstruction / Belt Slip",
        "possible_issues": [
            "Foreign object (coins, pins) trapped inside the drain pump impeller chamber",
            "Hydraulic suspension shock dampers worn out causing excessive spin wobble",
            "Drive motor carbon brushes or poly-V belt slipped/snapped"
        ],
        "urgency": "HIGH",
        "tip": "Check that the machine is placed on a solid level floor. Do not overload with waterlogged heavy blankets.",
        "troubleshooting_steps": [
            "Check bottom front coin-trap / drain filter and clean out debris and hair",
            "Verify the drain hose is not kinked, crushed, or elevated higher than 1 meter",
            "Ensure the 4 adjustable leveling feet sit firmly on the ground with locknuts tight",
            "Redistribute wet laundry evenly around drum perimeter to resolve unbalance error"
        ],
        "recommended_service": "Washing Machine Drum & Motor Service",
        "recommended_services": [
            "Washing Machine Drum & Motor Service",
            "Drain Pump & Inlet Valve Overhaul"
        ]
    },
    "water-purifier": {
        "display_name": "RO & Water Purifier",
        "keywords": [
            "ro", "water purifier", "purifier", "tds", "water filter", "membrane", "water taste",
            "purifier leaking", "purifier beep", "wastewater running", "low water flow",
            "sediment filter", "carbon filter", "kent", "aquaguard"
        ],
        "problem": "Semi-Permeable RO Membrane Pore Siltation / Carbon Filter Exhaustion",
        "possible_issues": [
            "Suspended colloidal particles clogging the 5-micron pre-sediment filter",
            "RO thin-film composite membrane scaling with dissolved salts (high output TDS)",
            "Booster pump head diaphragm pressure loss (<60 PSI)"
        ],
        "urgency": "HIGH",
        "tip": "Do not consume water if TDS exceeds safe limits or if purifier emits continuous warning beeps. Switch off incoming diverter valve if leaking.",
        "troubleshooting_steps": [
            "Check that input raw water supply valve is fully open and water tank has supply",
            "Inspect clear sediment pre-filter housing on wall; replace if dark brown/muddy",
            "Check if rejected wastewater tube is flowing freely or completely choked",
            "Schedule complete 4-stage filter replacement if service life has exceeded 9-12 months"
        ],
        "recommended_service": "RO Complete Filter & Membrane Overhaul",
        "recommended_services": [
            "RO Complete Filter & Membrane Overhaul",
            "Water Purifier TDS Calibration & Sanitization"
        ]
    },
    "kitchen-appliances": {
        "display_name": "Kitchen Appliances",
        "keywords": [
            "microwave", "oven", "otg", "chimney", "kitchen chimney", "induction", "cooktop",
            "gas stove", "hob", "mixer", "grinder", "blender", "spark in microwave",
            "chimney smoke", "exhaust fan", "dishwasher"
        ],
        "problem": "Magnetron Waveguide Sparking / Chimney Blower Degreasing / Thermal Sensor",
        "possible_issues": [
            "Mica waveguide cover saturated with grease splatter causing microwave arcing",
            "Heavy oil sludge choking suction baffle filters in kitchen chimney",
            "Overheating safety thermal cut-off sensor open circuit"
        ],
        "urgency": "MEDIUM",
        "tip": "Never place metallic objects, gold-rimmed plates, or aluminum foil inside microwaves. Clean chimney baffle filters regularly.",
        "troubleshooting_steps": [
            "For microwaves: check the rectangular mica plate inside chamber for scorch marks",
            "For chimneys: remove baffle filters and soak in boiling water with soda/degreaser",
            "For induction: ensure flat ferromagnetic cookware and verify air exhaust vents are clear",
            "If sparks or electrical burning occurs, discontinue use and unplug immediately"
        ],
        "recommended_service": "Kitchen Appliance Deep Diagnostic & Repair",
        "recommended_services": [
            "Kitchen Appliance Deep Diagnostic & Repair",
            "Kitchen Chimney Deep Degreasing"
        ]
    },
    "carpentry": {
        "display_name": "Carpentry & Woodwork",
        "keywords": [
            "carpentry", "carpenter", "door", "window", "lock", "hinge", "drawer", "cupboard",
            "wardrobe", "furniture", "bed", "table", "chair", "wood", "wooden", "latch",
            "door jammed", "door sticking", "handle broken", "drawer slide", "hinge loose"
        ],
        "problem": "Moisture Timber Swelling / Hinge Alignment Drift / Lock Mortise Misalignment",
        "possible_issues": [
            "Atmospheric humidity causing wooden door margins to swell and scrape door frame",
            "Stripped screw threads in particle board or plywood hinge mounting holes",
            "Mortise lock bolt misaligned with brass strike plate on door jamb"
        ],
        "urgency": "MEDIUM",
        "tip": "Avoid forcing jammed doors with excessive leverage to prevent shattering the lock casing or frame.",
        "troubleshooting_steps": [
            "Inspect the top and side door perimeter to locate the exact rubbing contact point",
            "Tighten all visible screws on top and bottom hinge plates using a hand screwdriver",
            "Apply graphite powder or silicone spray to sticky latch bolts; avoid cooking oil",
            "Schedule a carpenter for precision electric planer trimming and hinge re-seating"
        ],
        "recommended_service": "Carpentry Door & Furniture Repair",
        "recommended_services": [
            "Carpentry Door & Furniture Repair",
            "Cabinet Hinge & Lock Replacement"
        ]
    },
    "painting-waterproofing": {
        "display_name": "Painting & Waterproofing",
        "keywords": [
            "painting", "paint", "painter", "waterproofing", "seepage", "dampness", "damp",
            "peeling", "flaking", "wall moisture", "fungus", "mold", "mould", "wall crack",
            "putty", "distemper", "primer", "ceiling leak", "efflorescence", "whitewash"
        ],
        "problem": "Hydrostatic Wall Efflorescence / Capillary Water Seepage / Primer De-bonding",
        "possible_issues": [
            "Concealed bathroom pipe seepage or exterior facade rain penetration",
            "Absence of crystalline waterproofing barrier leading to salt efflorescence (shora)",
            "Moisture trapped behind elastomeric putty coat causing blister peeling"
        ],
        "urgency": "MEDIUM",
        "tip": "Never apply fresh paint over active dampness or wet plaster without fixing the underlying water source first.",
        "troubleshooting_steps": [
            "Identify whether the damp patch corresponds to an adjacent bathroom or plumbing shaft",
            "Use a moisture meter to map dampness gradient across the affected wall area",
            "Scrape off loose flakes and clean black surface mold using diluted antiseptic wash",
            "Book an infrared wall moisture scan and polymer-modified waterproofing repair"
        ],
        "recommended_service": "Wall Waterproofing & Dampness Cure",
        "recommended_services": [
            "Wall Waterproofing & Dampness Cure",
            "Home Interior & Exterior Painting"
        ]
    },
    "pest-control": {
        "display_name": "Pest Control & Fumigation",
        "keywords": [
            "pest", "pest control", "termites", "termite", "cockroach", "cockroaches", "bed bugs",
            "bedbug", "bedbugs", "ant", "ants", "rodent", "rodents", "rat", "mice", "fumigation",
            "insects", "bugs", "wood borer", "mosquitoes", "pest inspection"
        ],
        "problem": "Subterranean Termite Infestation / Nocturnal Cimex Colony / Kitchen Roach Harborage",
        "possible_issues": [
            "Subterranean termite mud tubes emerging from floor baseboards or door casings",
            "German cockroach infestation sheltered in warm motor enclosures and modular hinges",
            "Bed bug infestation inside mattress seams, headboard tufts, and electrical conduits"
        ],
        "urgency": "HIGH",
        "tip": "Avoid spraying retail aerosols directly onto termite mud tunnels, as this causes colonies to scatter deeper into structural wood.",
        "troubleshooting_steps": [
            "Keep affected rooms dry and inspect wooden baseboards with a flashlight",
            "Seal kitchen food containers and clear paper cardboard boxes which harbor insects",
            "Do not disturb suspected termite trails until technician can inject targeted termiticide",
            "Schedule odorless gel baiting and pressurized drilling treatment"
        ],
        "recommended_service": "Comprehensive Pest Control & Termite Treatment",
        "recommended_services": [
            "Comprehensive Pest Control & Termite Treatment",
            "Anti-Cockroach & Bed Bug Gel Extermination"
        ]
    },
    "home-cleaning": {
        "display_name": "Deep Cleaning & Sanitization",
        "keywords": [
            "cleaning", "clean", "deep cleaning", "sofa", "sofa cleaning", "carpet", "mattress",
            "bathroom cleaning", "kitchen cleaning", "scrubbing", "stain", "stains", "sanitization",
            "house cleaning", "floor polishing", "tile scrubbing"
        ],
        "problem": "Organic Fabric Stain Binding / Grout Limescale Encrustation / Dust Mite Biofilm",
        "possible_issues": [
            "Grease and food spillage bound deep into sofa upholstery microfiber fabric",
            "Hard water calcium carbonate scale encrusted on bathroom ceramic tile grout",
            "Microscopic dust mite and allergen accumulation in mattresses and rugs"
        ],
        "urgency": "LOW",
        "tip": "Blot fresh spills immediately with clean microfiber cloth; avoid harsh bleach which discolors fabric dyes.",
        "troubleshooting_steps": [
            "Vacuum upholstery using a soft brush attachment to remove loose dry dirt particles",
            "Pre-treat isolated grease spots with mild pH-neutral detergent solution",
            "Ensure adequate ventilation and ceiling fans to speed natural drying",
            "Book professional injection-extraction hot water steam shampooing"
        ],
        "recommended_service": "Full Home Deep Jet Cleaning",
        "recommended_services": [
            "Full Home Deep Jet Cleaning",
            "Sofa & Carpet Foam Extraction Sanitization"
        ]
    },
    "home-security": {
        "display_name": "Smart Home & Security",
        "keywords": [
            "cctv", "camera", "security camera", "smart lock", "video doorbell", "intercom",
            "smart home", "biometric lock", "fingerprint lock", "surveillance", "dvr", "nvr"
        ],
        "problem": "PoE Power Sourcing Drop / Wi-Fi Latency Dropout / Motorized Deadbolt Jam",
        "possible_issues": [
            "Insufficient 12V DC power over long CAT6 ethernet runs causing camera night resets",
            "2.4GHz Wi-Fi signal attenuation causing doorbell offline video feed latency",
            "Door misalignment exerting mechanical side-load pressure against motorized deadbolt"
        ],
        "urgency": "MEDIUM",
        "tip": "Keep emergency physical master keys for smart locks accessible in an external location.",
        "troubleshooting_steps": [
            "Power-cycle the central DVR/NVR unit and PoE network switch",
            "Inspect physical RJ45 network connectors and power adapter for loose seating",
            "Check smart lock battery voltage indicator; replace with fresh alkaline batteries",
            "Schedule an authorized smart home technician for camera re-alignment and diagnostics"
        ],
        "recommended_service": "CCTV & Smart Security System Setup",
        "recommended_services": [
            "CCTV & Smart Security System Setup",
            "Smart Door Lock Calibration"
        ]
    },
    "masonry-flooring": {
        "display_name": "Masonry, Tiles & Flooring",
        "keywords": [
            "tile", "tiles", "flooring", "marble", "granite", "grout", "cracked tile",
            "hollow tile", "loose tile", "roof leak", "plaster", "cement", "masonry", "brickwork"
        ],
        "problem": "Debonding Polymer Adhesive / Sub-Floor Expansion Void / Epoxy Grout Deterioration",
        "possible_issues": [
            "Sub-floor thermal expansion causing tiles to tent or sound hollow when tapped",
            "Deteriorated grout lines allowing surface water to collect beneath the tile bed",
            "Settlement cracks running through plaster and mortar masonry joints"
        ],
        "urgency": "MEDIUM",
        "tip": "Tape over sharp edges of cracked tiles to prevent foot injuries until repair.",
        "troubleshooting_steps": [
            "Tap suspect tiles gently with wooden handle to detect hollow delamination sounds",
            "Clean joint lines with a nylon brush to inspect depth of missing grout",
            "Keep dry and avoid walking on wobbling loose tiles to prevent fracturing adjacent slabs",
            "Book tile replacement, regrouting, and diamond marble crystallization polishing"
        ],
        "recommended_service": "Tile Repair & Grout Re-Pointing",
        "recommended_services": [
            "Tile Repair & Grout Re-Pointing",
            "Marble Polishing & Floor Care"
        ]
    }
}

# Out-of-Domain Detection Keywords and Patterns
OUT_OF_DOMAIN_PATTERNS = [
    r"\b(who is|who was|who won|capital of|president of|prime minister)\b",
    r"\b(tell me a joke|write a poem|write a song|write a story|write an essay|write code|python script)\b",
    r"\b(what is the meaning of life|how old are you|who created you|are you real|are you human)\b",
    r"\b(recipe for|how to cook|bake a cake|ingredients for|how to make biryani)\b",
    r"\b(movie recommendation|song recommendation|weather in|stock price|crypto|bitcoin)\b",
    r"\b(how to get rich|workout plan|diet plan|lose weight|symptoms of covid|blood pressure)\b",
    r"\b(translate|calculate|solve this math|\d+\s*[\+\-\*\/]\s*\d+)\b"
]

GREETING_PATTERNS = [
    r"^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|yo|hola)[\s\.\!\?]*$",
    r"^(who are you|what can you do|help me|how does this work)[\s\.\!\?]*$"
]


class DiagnosisEngine:
    def __init__(self):
        self.model = None
        self.gemini = GeminiExplanationEngine()

        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception:
                self.model = None

    def is_out_of_domain(self, text: str) -> bool:
        """Determines if the query is unrelated to home maintenance, appliances or repair services."""
        lower = text.lower().strip()

        # Check greetings
        for pat in GREETING_PATTERNS:
            if re.search(pat, lower):
                return True

        # Check explicit out-of-domain patterns
        for pat in OUT_OF_DOMAIN_PATTERNS:
            if re.search(pat, lower):
                return True

        # Check if text contains ANY home domain keyword
        for cat_info in DOMAIN_KNOWLEDGE.values():
            for kw in cat_info["keywords"]:
                if kw in lower:
                    return False

        # General repair/problem words
        repair_triggers = [
            "repair", "fix", "broken", "not working", "service", "maintenance", "damage",
            "leak", "install", "installation", "noise", "smell", "technician", "clean",
            "replace", "faulty", "issue", "problem", "inspection", "appliance", "home"
        ]
        if any(trig in lower for trig in repair_triggers):
            return False

        # If it's a general statement or question with no service words, classify as out of domain
        return True

    def find_best_domain(self, text: str) -> tuple:
        """Scores all categories based on primary keywords, general keywords, and relevance."""
        lower = text.lower().strip()
        best_cat = None
        best_score = 0

        # Define high-priority distinctive domain markers
        PRIMARY_MARKERS = {
            "pest-control": ["termite", "termites", "bedbug", "bedbugs", "bed bug", "bed bugs", "cockroach", "cockroaches", "pest", "pest control", "rodent", "rodents", "rat", "mice", "wood borer"],
            "water-heater": ["geyser", "water heater", "immersion rod", "boiler"],
            "air-conditioner": ["ac", "air conditioner", "split ac", "window ac", "cooling", "cool", "compressor", "freon", "refrigerant"],
            "plumbing": ["pipe", "plumbing", "leak", "leaking", "tap", "faucet", "drain", "drainage", "clog", "sewer", "toilet", "commode", "flush", "cistern"],
            "refrigerator": ["fridge", "refrigerator", "freezer", "ice maker"],
            "washing-machine": ["washing machine", "washer", "dryer", "spin cycle", "drum not turning", "drain pump"],
            "water-purifier": ["water purifier", "purifier", "ro", "tds", "filter membrane"],
            "kitchen-appliances": ["microwave", "oven", "otg", "chimney", "induction", "gas stove", "hob", "mixer grinder"],
            "painting-waterproofing": ["waterproofing", "seepage", "dampness", "wall damp", "paint peeling", "wall paint", "efflorescence"],
            "carpentry": ["carpenter", "carpentry", "door jammed", "door sticking", "hinge", "drawer slide", "mortise lock", "cupboard repair"],
            "home-cleaning": ["deep cleaning", "sofa cleaning", "carpet cleaning", "mattress cleaning", "sofa shampooing"],
            "home-security": ["cctv", "security camera", "smart lock", "video doorbell", "intercom"],
            "masonry-flooring": ["cracked tile", "loose tile", "grout repair", "marble polish", "flooring crack"]
        }

        for cat, info in DOMAIN_KNOWLEDGE.items():
            score = 0
            # Check high-priority distinctive markers first
            markers = PRIMARY_MARKERS.get(cat, [])
            for m in markers:
                if re.search(r"\b" + re.escape(m) + r"\b", lower):
                    score += 50

            # General keywords
            for kw in info["keywords"]:
                if kw in lower:
                    score += len(kw.split()) * 10

            if score > best_score:
                best_score = score
                best_cat = cat

        if best_cat and best_score >= 15:
            confidence = min(98.0, 75.0 + float(min(23.0, best_score * 0.4)))
            return best_cat, confidence

        # Fallback to ML model if available and reasonable
        if self.model:
            try:
                pred_cat = self.model.predict([text])[0]
                probs = self.model.predict_proba([text])[0]
                cat_idx = list(self.model.classes_).index(pred_cat)
                ml_conf = float(np.round(probs[cat_idx] * 100, 2))
                if ml_conf >= 45.0:
                    return pred_cat, ml_conf
            except Exception:
                pass

        return None, 0.0

    def diagnose(self, text: str):
        if not text or len(text.strip()) == 0:
            return {"error": "Problem description cannot be empty"}

        cleaned = text.strip()

        # Check if greeting or out of domain
        if self.is_out_of_domain(cleaned):
            return self.generate_out_of_domain_response(cleaned)

        cat, confidence = self.find_best_domain(cleaned)

        if not cat:
            # If still not classified but passed out-of-domain check, provide helpful general repair answer
            return self.generate_general_service_response(cleaned)

        info = DOMAIN_KNOWLEDGE.get(cat, DOMAIN_KNOWLEDGE["air-conditioner"])

        result = {
            "is_out_of_domain": False,
            "predicted_category": cat,
            "category_display": info.get("display_name", cat.title()),
            "confidence_score": confidence,
            "possible_issue": info["problem"],
            "possible_issues": info.get("possible_issues", [info["problem"]]),
            "urgency": info["urgency"],
            "troubleshooting_advice": info["tip"],
            "troubleshooting_steps": info.get("troubleshooting_steps", [info["tip"]]),
            "recommended_service": info["recommended_service"],
            "recommended_services": info.get("recommended_services", [info["recommended_service"]]),
            "disclaimer": "AI preliminary diagnosis only. Physical inspection by a certified Byte Force engineer is recommended before repairs."
        }

        # Attempt Gemini enhancement if configured
        try:
            gemini_result = self.gemini.explain_diagnosis(cleaned, result)
            result.update(gemini_result)
        except Exception:
            result["gemini_status"] = "unavailable"
            result["gemini_explanation"] = None

        return result

    def generate_out_of_domain_response(self, text: str) -> dict:
        """Agent-like friendly response when asked about anything outside home maintenance."""
        agent_msg = (
            f"Hello! I am HomeGenie AI, your dedicated Home Maintenance and Service Diagnostic Agent.\n\n"
            f"I specialize exclusively in diagnosing problems, assessing safety urgency, and recommending "
            f"expert solutions for home appliances, electrical systems, plumbing, carpentry, painting, "
            f"pest control, and general home repair.\n\n"
            f"Your question appears to be outside my home services domain. "
            f"To get an accurate diagnosis, please describe a home maintenance issue or appliance symptom you're experiencing!"
        )

        return {
            "is_out_of_domain": true if False else True,
            "predicted_category": "General Home Services",
            "category_display": "HomeGenie AI Assistant",
            "confidence_score": 0,
            "urgency": "INFO",
            "possible_issue": "Query is outside the home maintenance & repair domain.",
            "possible_issues": [],
            "troubleshooting_advice": "Please ask a question related to home repair, appliance malfunctions, leaks, or maintenance.",
            "troubleshooting_steps": [],
            "recommended_service": "Explore All Home Services",
            "recommended_services": [
                "Air Conditioner Care",
                "Electrical Systems",
                "Plumbing & Water",
                "Refrigeration",
                "Washing Machine Repair",
                "RO & Water Purifier",
                "Pest Control & Painting"
            ],
            "agent_message": agent_msg,
            "gemini_explanation": agent_msg,
            "disclaimer": "HomeGenie AI is specialized in home services, appliance health, and home maintenance diagnostics."
        }

    def generate_general_service_response(self, text: str) -> dict:
        """Helpful response when the query is about home maintenance but lacks specific appliance details."""
        return {
            "is_out_of_domain": False,
            "predicted_category": "general",
            "category_display": "General Home Maintenance",
            "confidence_score": 75.0,
            "possible_issue": "General Home Appliance / Fixture Inspection Required",
            "possible_issues": [
                "General component wear-and-tear or physical obstruction",
                "Operating settings or power/water input supply irregularity",
                "Preventive routine servicing overdue"
            ],
            "urgency": "MEDIUM",
            "troubleshooting_advice": "Check primary power switch, verify water/electricity supply lines, and note any strange vibrations or odors.",
            "troubleshooting_steps": [
                "Ensure the appliance or fixture is properly plugged in with switch turned ON",
                "Check that the main circuit breaker (MCB) has not tripped in your distribution box",
                "Observe if there is any unusual burning smell, sparking, or water pooling",
                "Provide more details (e.g. appliance brand or specific sound) for a deeper diagnosis"
            ],
            "recommended_service": "Comprehensive Home Health Audit",
            "recommended_services": [
                "Comprehensive Home Health Audit",
                "Electrical Safety Audit",
                "Plumbing Inspection"
            ],
            "disclaimer": "AI preliminary diagnosis only. A certified technician can inspect and resolve the issue safely."
        }
