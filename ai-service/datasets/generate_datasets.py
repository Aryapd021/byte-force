"""
Byte Force - AI Dataset Generator
Generates realistic, reproducible synthetic datasets for training all ML modules:
1. NLP Diagnosis & Category Classification
2. FairPrice Regression Model
3. Customer Satisfaction Classification Model
4. Appliance Health & Maintenance Risk Prediction
"""

import os
import json
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = BASE_DIR
os.makedirs(DATA_DIR, exist_ok=True)

def generate_diagnosis_data():
    """Generates natural language problem queries and corresponding labels."""
    queries = [
        # Air Conditioner Care
        ("My AC is running but blowing warm air and not cooling", "air-conditioner", "Low Refrigerant / Gas Leak", "HIGH", "Check if indoor filter is clean and ensure outdoor condenser unit fan is rotating freely."),
        ("AC is making a loud rattling sound and leaking water inside bedroom", "air-conditioner", "Drain Pipe Clogged / Blower Imbalance", "HIGH", "Turn off unit to avoid ceiling plaster damage; inspect indoor drain tray."),
        ("Split AC turns on for 5 minutes then trips circuit breaker", "air-conditioner", "Compressor Short Circuit / Faulty Capacitor", "CRITICAL", "Do not forcefully reset breaker repeatedly to prevent electrical fires."),
        ("Air conditioner airflow is very weak and smells musty", "air-conditioner", "Dust Choked Evaporator Coil", "MEDIUM", "Remove and rinse mesh dust filters under warm water."),
        ("Inverter AC showing error code E6 on display", "air-conditioner", "PCB Communication Failure", "HIGH", "Power cycle from main isolator switch for 5 minutes."),
        ("Need annual seasonal deep cleaning for split AC before summer", "air-conditioner", "Seasonal Maintenance", "LOW", "Ensure outdoor unit has unobstructed clearance."),
        ("AC outdoor compressor is overheating and shutting down", "air-conditioner", "Condenser Fan Motor Malfunction", "HIGH", "Keep outdoor unit sheltered from direct heat trap if possible."),
        ("Ice forming on AC indoor copper pipes and coils", "air-conditioner", "Low Gas Pressure / Blocked Air Filter", "HIGH", "Switch mode to Fan Only to melt ice; do not chip with sharp tools."),
        
        # Electrical Systems
        ("Living room switchboard is sparking when plugging in iron", "electrical", "Loose Terminal / Burnt Switch", "CRITICAL", "Turn off the sub-circuit MCB immediately to prevent short circuit."),
        ("Main MCB switch trips every time geyser is turned on", "electrical", "Heating Element Earth Leakage", "HIGH", "Avoid touching water taps connected to water heater while testing."),
        ("Ceiling fan is running extremely slow even at maximum speed", "electrical", "Degraded Fan Capacitor", "LOW", "Test if fan blade spins freely by hand when turned off."),
        ("Half the sockets in the kitchen have no electricity", "electrical", "Blown Fuse / Tripped RCCB", "MEDIUM", "Check distribution board for any trip lever in neutral position."),
        ("Notice burning plastic smell coming from main electrical distribution box", "electrical", "Busbar Overheating / Loose Neutral", "CRITICAL", "Switch off the main isolator switch immediately and keep dry chemical extinguisher accessible."),
        ("Smart switch installed is offline and buzzing faintly", "electrical", "Capacitive Power Supply Defect", "MEDIUM", "Disconnect from mobile app and check power line."),
        ("Need complete electrical wiring audit for older apartment", "electrical", "Safety Audit", "LOW", "Locate master building electrical meter."),
        
        # Plumbing & Water
        ("Concealed wall pipe leaking behind bathroom tiles with seepage", "plumbing", "Concealed Pipe Rupture", "CRITICAL", "Shut off bathroom vertical riser control valve."),
        ("Kitchen sink drain is completely clogged with standing greasy water", "plumbing", "Drain Trap Obstruction", "HIGH", "Avoid dumping boiling water if PVC pipes are installed."),
        ("Bathroom mixer faucet is dripping continuously from the spout", "plumbing", "Worn Ceramic Cartridge", "LOW", "Turn off under-sink angle stopcock valve."),
        ("Water pressure from overhead shower is very weak and erratic", "plumbing", "Mineral Scale Deposit / Blocked Aerator", "LOW", "Unscrew shower head and soak in vinegar solution."),
        ("Water pump motor in basement is vibrating excessively and not priming", "plumbing", "Air Lock / Impeller Wear", "HIGH", "Do not run pump dry to avoid burning the motor coil."),
        ("Toilet cistern flush valve is constantly running and wasting water", "plumbing", "Flapper Valve Deterioration", "MEDIUM", "Check float ball arm height adjustment inside flush tank."),
        
        # Refrigeration
        ("Fridge freezer is freezing ice but lower compartment is warm", "refrigerator", "Defrost Timer / Bi-metal Sensor Failure", "HIGH", "Ensure air vent damper between freezer and fridge is unblocked."),
        ("Refrigerator compressor is clicking every few minutes and stopping", "refrigerator", "Start Relay / PTC Starter Defect", "HIGH", "Unplug unit to prevent compressor winding burnout."),
        ("Water pooling under vegetable crisper drawers inside fridge", "refrigerator", "Drain Hole Freezing / Blockage", "MEDIUM", "Clear drain trough at rear interior wall with warm water."),
        ("Frost free refrigerator building thick sheet of ice on freezer coils", "refrigerator", "Defrost Heater Rod Burnout", "HIGH", "Transfer perishable foods to cool box."),
        ("Fridge is making loud humming noise that stops when door opens", "refrigerator", "Evaporator Fan Motor Bearing Wear", "MEDIUM", "Ensure fridge is leveled on all four feet."),
        
        # Washing Machine
        ("Front load washing machine shaking violently during final spin cycle", "washing-machine", "Worn Shock Absorbers / Drum Spider Crack", "HIGH", "Verify leveling feet locknuts and remove transit bolts if newly moved."),
        ("Washing machine will not drain water and displays error OE / E20", "washing-machine", "Foreign Object in Drain Filter", "HIGH", "Unscrew bottom front coin trap filter and empty water manually."),
        ("Washing machine drum is not turning but motor hums", "washing-machine", "Drive Belt Snapped / Motor Carbon Brushes", "HIGH", "Do not overload drum beyond rated dry capacity."),
        ("Water continues filling in drum even when machine is powered off", "washing-machine", "Faulty Water Inlet Solenoid Valve", "CRITICAL", "Turn off dedicated tap inlet valve immediately."),
        ("Clothes coming out soaked and unspun after wash cycle", "washing-machine", "Unbalanced Load Detection / Faulty Hall Sensor", "MEDIUM", "Redistribute bulky towels evenly inside drum."),
        
        # RO & Water Purifier
        ("RO water purifier continuous pure water trickle and waste water running non-stop", "water-purifier", "Choked Membrane / Auto Shut-off Valve Defect", "HIGH", "Check raw water tap supply pressure."),
        ("Purified drinking water tastes bitter or metallic with high TDS reading", "water-purifier", "Exhausted RO Membrane & Post Carbon", "HIGH", "Do not consume until TDS levels are verified under 150 PPM."),
        ("RO booster pump vibrating loudly with clicking noise", "water-purifier", "Booster Pump Diaphragm Wear", "MEDIUM", "Check inlet sediment filter bowl for sand clogging."),
        ("Water purifier leaking water from bottom of body cabinet", "water-purifier", "Loose Push-fit Elbow Fitting", "HIGH", "Turn off power adapter and blue inlet valve."),
        ("UV lamp indicator light is beeping and flashing red", "water-purifier", "UV Lamp / Ballast Failure", "HIGH", "Boil water prior to drinking until UV sterilization is restored.")
    ]
    
    # Augment data with realistic phrasing variants
    augmented = []
    modifiers = [
        "Urgent: ", "Help, ", "Since yesterday, ", "Our ", "Facing issue where ",
        "Please inspect: ", "Kindly fix: ", "Service needed: "
    ]
    
    for text, cat, prob, urg, tip in queries:
        augmented.append({
            "text": text,
            "category": cat,
            "problem_type": prob,
            "urgency": urg,
            "troubleshooting_tip": tip
        })
        for mod in modifiers[:4]:
            augmented.append({
                "text": f"{mod}{text.lower()}",
                "category": cat,
                "problem_type": prob,
                "urgency": urg,
                "troubleshooting_tip": tip
            })
            
    df = pd.DataFrame(augmented)
    csv_path = os.path.join(DATA_DIR, "diagnosis_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated Diagnosis Dataset: {len(df)} samples -> {csv_path}")
    return df

def generate_fairprice_data(n_samples=3000):
    """Generates synthetic historical repair records for FairPrice AI regression."""
    categories = ['air-conditioner', 'electrical', 'plumbing', 'refrigerator', 'washing-machine', 'water-purifier']
    base_price_map = {
        'air-conditioner': 550,
        'electrical': 320,
        'plumbing': 350,
        'refrigerator': 600,
        'washing-machine': 700,
        'water-purifier': 650
    }
    zones = ['South Delhi', 'Central Delhi', 'West Delhi', 'Dwarka', 'Noida', 'Gurugram', 'East Delhi']
    zone_multiplier = {
        'South Delhi': 1.15,
        'Gurugram': 1.20,
        'Central Delhi': 1.10,
        'Noida': 1.05,
        'West Delhi': 1.00,
        'Dwarka': 1.02,
        'East Delhi': 0.95
    }
    
    records = []
    for _ in range(n_samples):
        cat = np.random.choice(categories)
        zone = np.random.choice(zones)
        complexity = np.random.choice(['LOW', 'MEDIUM', 'HIGH'], p=[0.4, 0.45, 0.15])
        comp_mult = {'LOW': 1.0, 'MEDIUM': 1.45, 'HIGH': 2.1}[complexity]
        
        parts_needed = int(np.random.choice([0, 1], p=[0.35, 0.65]))
        labor_hours = np.round(np.random.uniform(0.75, 3.5) * (1.3 if complexity == 'HIGH' else 1.0), 1)
        base = base_price_map[cat]
        
        labor_cost = labor_hours * 350 * zone_multiplier[zone]
        parts_cost = np.random.uniform(200, 1800) * parts_needed if parts_needed else 0
        urgency_surge = np.random.choice([0.0, 0.15, 0.25], p=[0.7, 0.2, 0.1])
        
        actual_price = (base + labor_cost + parts_cost) * (1 + urgency_surge)
        # Add realistic market noise
        noise = np.random.normal(0, 35)
        actual_price = max(249, np.round(actual_price + noise, 0))
        
        records.append({
            'category': cat,
            'zone': zone,
            'complexity': complexity,
            'parts_needed': parts_needed,
            'labor_hours': labor_hours,
            'estimated_labor': round(labor_cost, 2),
            'estimated_parts': round(parts_cost, 2),
            'urgency_surge': urgency_surge,
            'final_price': actual_price
        })
        
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "fairprice_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated FairPrice Dataset: {len(df)} samples -> {csv_path}")
    return df

def generate_satisfaction_data(n_samples=2500):
    """Generates customer satisfaction data for classification."""
    categories = ['air-conditioner', 'electrical', 'plumbing', 'refrigerator', 'washing-machine', 'water-purifier']
    
    records = []
    for _ in range(n_samples):
        cat = np.random.choice(categories)
        tech_rating = np.round(np.random.normal(4.7, 0.35), 2)
        tech_rating = min(5.0, max(3.0, tech_rating))
        
        tech_experience = np.random.randint(1, 15)
        delay_mins = int(np.random.exponential(scale=12)) # 0 to ~60 mins
        
        # Price deviation percentage: -10% to +30%
        price_dev_pct = np.round(np.random.normal(5.0, 10.0), 1)
        
        # Complex scoring rule reflecting customer sentiment
        score = (
            (tech_rating / 5.0) * 45 +
            max(0, (30 - delay_mins)) * 0.8 +
            max(0, (15 - price_dev_pct)) * 0.7 +
            min(tech_experience, 10) * 1.5 +
            np.random.normal(0, 4)
        )
        score = min(100, max(10, score))
        
        # Binary satisfaction: >= 75 is 1 (Satisfied), else 0 (At Risk)
        is_satisfied = 1 if score >= 70 else 0
        
        satisfaction_tier = 'VERY_SATISFIED' if score >= 85 else ('SATISFIED' if score >= 70 else 'AT_RISK')
        
        records.append({
            'category': cat,
            'tech_rating': tech_rating,
            'tech_experience': tech_experience,
            'delay_mins': delay_mins,
            'price_dev_pct': price_dev_pct,
            'satisfaction_score': round(score, 1),
            'is_satisfied': is_satisfied,
            'satisfaction_tier': satisfaction_tier
        })
        
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "satisfaction_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated Satisfaction Dataset: {len(df)} samples -> {csv_path}")
    return df

def generate_appliance_health_data(n_samples=2000):
    """Generates appliance health score & maintenance risk training data."""
    categories = ['air-conditioner', 'electrical', 'plumbing', 'refrigerator', 'washing-machine', 'water-purifier']
    
    records = []
    for _ in range(n_samples):
        cat = np.random.choice(categories)
        age_years = np.round(np.random.uniform(0.2, 10.0), 1)
        usage = np.random.choice(['LIGHT', 'MODERATE', 'HEAVY', 'EXTREME'], p=[0.2, 0.45, 0.25, 0.1])
        usage_factor = {'LIGHT': 1.0, 'MODERATE': 1.25, 'HEAVY': 1.7, 'EXTREME': 2.3}[usage]
        
        prev_repairs = np.random.poisson(lam=age_years * 0.4)
        days_since_service = int(np.random.uniform(10, 600))
        has_symptoms = int(np.random.choice([0, 1], p=[0.65, 0.35]))
        
        # Calculate health score: 100 base
        degradation = (
            (age_years * 4.5) +
            (usage_factor * 8.0) +
            (prev_repairs * 6.0) +
            ((days_since_service / 365.0) * 15.0) +
            (has_symptoms * 22.0) +
            np.random.normal(0, 3)
        )
        health_score = int(min(100, max(15, 100 - degradation)))
        
        if health_score >= 80:
            risk = 'LOW'
        elif health_score >= 65:
            risk = 'MEDIUM'
        elif health_score >= 45:
            risk = 'HIGH'
        else:
            risk = 'CRITICAL'
            
        records.append({
            'category': cat,
            'age_years': age_years,
            'usage_intensity': usage,
            'prev_repairs': prev_repairs,
            'days_since_service': days_since_service,
            'has_symptoms': has_symptoms,
            'health_score': health_score,
            'maintenance_risk': risk
        })
        
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "appliance_health_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated Appliance Health Dataset: {len(df)} samples -> {csv_path}")
    return df

if __name__ == '__main__':
    print("Beginning Byte Force Dataset Generation...")
    generate_diagnosis_data()
    generate_fairprice_data()
    generate_satisfaction_data()
    generate_appliance_health_data()
    print("All synthetic datasets successfully generated!")
