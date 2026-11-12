import os
import sys
import getpass
import pymysql
import ssl

HOST = "mysql-byte-force-byte-force.b.aivencloud.com"
PORT = 14815
USER = "avnadmin"
DB = "defaultdb"

def get_connection(password):
    return pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=password,
        database=DB,
        ssl={'ssl_mode': 'REQUIRED'},
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )

def check_database(password):
    print(f"\nConnecting to {HOST}:{PORT}/{DB} as {USER}...")
    try:
        conn = get_connection(password)
        with conn.cursor() as cur:
            cur.execute("SHOW TABLES;")
            tables = cur.fetchall()
            if not tables:
                print("❌ No tables found in the database. The database is empty.")
                return False
            
            table_col = list(tables[0].keys())[0]
            print(f"\n✅ Connected! Found {len(tables)} tables:\n")
            print(f"{'Table Name':<30} | {'Row Count':<10}")
            print("-" * 45)
            for t in tables:
                t_name = t[table_col]
                try:
                    cur.execute(f"SELECT COUNT(*) as cnt FROM `{t_name}`")
                    cnt = cur.fetchone()['cnt']
                    print(f"{t_name:<30} | {cnt:<10}")
                except Exception as ex:
                    print(f"{t_name:<30} | ERROR: {ex}")
            return True
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def migrate_database(password):
    print(f"\n🚀 Starting migration to Aiven MySQL ({HOST}:{PORT}/{DB})...")
    conn = None
    try:
        conn = get_connection(password)
        schema_path = os.path.join(os.path.dirname(__file__), "railway_schema.sql")
        if not os.path.exists(schema_path):
            print(f"❌ Schema file not found: {schema_path}")
            return False

        with open(schema_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        statements = [s.strip() for s in sql_script.split(";") if s.strip()]

        with conn.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
            print(f"Executing {len(statements)} schema statements...")
            for i, stmt in enumerate(statements, 1):
                try:
                    cur.execute(stmt)
                except Exception as e:
                    print(f"⚠️ Statement {i} notice: {e}")
            cur.execute("SET FOREIGN_KEY_CHECKS = 1;")

        print("✅ Schema created successfully! Now seeding demo data...")
        seed_data(conn)
        print("\n🎉 Migration & Seeding Complete!")
        check_database(password)
        return True
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    finally:
        if conn:
            conn.close()

def seed_data(conn):
    with conn.cursor() as cur:
        # Users
        users = [
            (1, 'admin@byteforce.ai', '$2y$10$qrAuC92Jgp24LHeLTpokU.7jtmqP7C61S0KHngrvX.QCHHMdHrB4C', 'admin', 'Chief System Administrator', '+91 98765 00001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
            (2, 'tech.rajesh@byteforce.ai', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'technician', 'Rajesh Kumar', '+91 98765 11002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
            (3, 'tech.amit@byteforce.ai', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'technician', 'Amit Sharma', '+91 98765 11003', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
            (4, 'tech.priya@byteforce.ai', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'technician', 'Priya Patel', '+91 98765 11004', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
            (5, 'tech.vikram@byteforce.ai', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'technician', 'Vikram Singh', '+91 98765 11005', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
            (6, 'customer.rahul@gmail.com', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'customer', 'Rahul Verma', '+91 98111 22334', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
            (7, 'customer.ananya@gmail.com', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'customer', 'Ananya Sen', '+91 98222 33445', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
            (8, 'customer.rohit@gmail.com', '$2y$10$dmCSZOjCq4phFzUE0wk.L.neK8dIrzagyJX63zFNU9ojpYHaiHzmu', 'customer', 'Rohit Malhotra', '+91 98333 44556', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150')
        ]
        cur.executemany("INSERT IGNORE INTO users (id, email, password_hash, role, full_name, phone, avatar_url) VALUES (%s, %s, %s, %s, %s, %s, %s)", users)

        # Service Categories
        cur.execute("""
            INSERT IGNORE INTO service_categories (id, name, slug, description, icon, is_active, display_order) VALUES
            (1, 'Air Conditioner Care', 'air-conditioner', 'Comprehensive split and window AC deep cleaning, refrigerant recharge and PCB repairs.', 'Wind', 1, 1),
            (2, 'Electrical Systems', 'electrical', 'Complete home wiring, short circuit isolation, circuit breakers, smart fans and sockets.', 'Zap', 1, 2),
            (3, 'Plumbing & Water', 'plumbing', 'Pipe leak detection, bathroom fittings, tap upgrades, drain unclogging and water pump repairs.', 'Droplet', 1, 3),
            (4, 'Refrigeration', 'refrigerator', 'Frost-free & inverter refrigerator cooling repairs, thermostat replacements and gas leak fixes.', 'Snowflake', 1, 4),
            (5, 'Washing Machine', 'washing-machine', 'Front load, top load and semi-automatic drum motor repair, drainage pump fixes and noise diagnosis.', 'RotateCw', 1, 5),
            (6, 'RO & Water Purifier', 'water-purifier', 'Membrane replacement, TDS balance adjustments, carbon filter renew and pump repairs.', 'ShieldCheck', 1, 6)
        """)

        # Services
        cur.execute("""
            INSERT IGNORE INTO services (id, category_id, name, slug, description, base_price, estimated_duration_mins, warranty_days, image_url, is_active) VALUES
            (1, 1, 'AC Deep Jet Cleaning & Sanitization', 'ac-deep-jet-cleaning', 'High-pressure water jet washing of indoor and outdoor condenser coils, blower disinfection, and filter cleansing.', 599.00, 60, 30, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500', 1),
            (2, 1, 'AC Gas Leak Detection & Refill', 'ac-gas-leak-refill', 'Nitrogen pressure testing, brazing copper leak spots, vacuuming, and complete R32/R410A refrigerant gas recharging.', 1899.00, 90, 60, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500', 1),
            (3, 1, 'AC Comprehensive Health Checkup', 'ac-health-checkup', 'Full 21-point electrical amp-draw test, compressor capacitor inspection, temperature delta check and drain line clearing.', 349.00, 45, 15, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500', 1),
            (4, 2, 'Switchboard & Circuit Breaker Repair', 'switchboard-circuit-breaker', 'Diagnosis of burnt fuses, tripping MCB switches, rewiring loose contacts and testing phase voltage.', 299.00, 45, 30, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500', 1),
            (5, 2, 'Complete Home Electrical Safety Audit', 'electrical-safety-audit', 'Insulation resistance testing, earthing/grounding verification, load balancing assessment for fire prevention.', 899.00, 90, 90, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500', 1),
            (6, 3, 'Concealed Pipe Leakage Detection', 'pipe-leak-detection', 'Acoustic & thermal inspection to locate concealed wall pipe cracks without destructive breaking.', 799.00, 60, 45, 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500', 1),
            (7, 3, 'Bathroom Tap & Drain Pipe Fitting', 'tap-drain-fitting', 'Replacement of faulty mixer faucets, angle valves, P-trap installation and silicone sealing.', 349.00, 45, 30, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500', 1),
            (8, 4, 'Refrigerator Cooling Repair & Thermostat', 'refrigerator-cooling-repair', 'Diagnostic for cooling loss, relay switch replacement, defrost timer inspection and evaporator fan motor repair.', 649.00, 75, 45, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500', 1),
            (9, 5, 'Washing Machine Drum & Motor Service', 'washing-machine-drum-service', 'Shock absorber replacement, drive belt adjustment, bearing noise dampening and spinner calibration.', 749.00, 80, 45, 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500', 1),
            (10, 6, 'RO Complete Filter & Membrane Overhaul', 'ro-membrane-overhaul', 'Replacement of sediment filter, pre-carbon block, RO membrane (75/100 GPD), and mineralizer cartridge.', 1499.00, 60, 60, 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500', 1)
        """)

        # Technician Profiles
        cur.execute("""
            INSERT IGNORE INTO technician_profiles (id, user_id, experience_years, bio, hourly_rate, rating, total_reviews, completed_jobs, is_verified, verification_status, current_latitude, current_longitude, service_zone) VALUES
            (1, 2, 8, 'Certified Master HVAC Engineer specializing in Daikin, Voltas, Hitachi split & inverter AC diagnostic, deep jet service and PCB diagnostics.', 499.00, 4.92, 142, 168, 1, 'VERIFIED', 28.5355, 77.2410, 'South Delhi'),
            (2, 3, 6, 'Licensed Grade-A Electrician with comprehensive expertise in smart switches, fuse repairs, short circuits and heavy home appliance cabling.', 399.00, 4.88, 98, 115, 1, 'VERIFIED', 28.6304, 77.2177, 'Central Delhi'),
            (3, 4, 7, 'Specialist plumber & RO water purifier technician with 7+ years in pressurized pipeline leakages, tap cartridge upgrades and Kent/Aquaguard systems.', 449.00, 4.95, 110, 134, 1, 'VERIFIED', 28.5800, 77.0500, 'Dwarka / West Delhi'),
            (4, 5, 9, 'Senior refrigeration and washing machine technician. Expert in front/top-load drum issues, inverter compressor replacements and gas recharging.', 549.00, 4.85, 175, 204, 1, 'VERIFIED', 28.6280, 77.3649, 'Noida / East Delhi')
        """)

        # Customer Profiles
        cur.execute("""
            INSERT IGNORE INTO customer_profiles (id, user_id, preferred_language, emergency_contact, home_type, notes) VALUES
            (1, 6, 'en', '+91 98111 99999', '3BHK Apartment', 'Prefers morning service slots between 9 AM and 1 PM'),
            (2, 7, 'en', '+91 98222 88888', 'Independent Villa', 'Has pets at home; calls prior to arrival requested'),
            (3, 8, 'hi', '+91 98333 77777', '2BHK Apartment', 'Security gate registration required at entrance')
        """)

        # Addresses
        cur.execute("""
            INSERT IGNORE INTO addresses (id, user_id, address_line1, address_line2, city, state, postal_code, landmark, latitude, longitude, is_default) VALUES
            (1, 6, 'Flat 402, Royal Palms Heights', 'South Extension Part II', 'New Delhi', 'Delhi', '110049', 'Near Metro Pillar 24', 28.5670, 77.2200, 1),
            (2, 6, 'Office 12B, Cyber Greens Tower', 'DLF Phase 2', 'Gurugram', 'Haryana', '122002', 'Opposite Cyber Hub', 28.4900, 77.0900, 0),
            (3, 7, 'Villa 14, Lotus Boulevard Espacia', 'Sector 100', 'Noida', 'Uttar Pradesh', '201304', 'Near Expressway Gate', 28.5300, 77.3700, 1),
            (4, 8, 'B-84, Pocket 2', 'Vasant Kunj', 'New Delhi', 'Delhi', '110070', 'Behind Fortis Hospital', 28.5200, 77.1500, 1)
        """)

        # Appliances
        cur.execute("""
            INSERT IGNORE INTO appliances (id, customer_id, category_id, appliance_name, brand, model_number, serial_number, purchase_date, installation_date, last_service_date, health_score, maintenance_risk, reported_symptoms, usage_intensity, recommended_service, status) VALUES
            (1, 6, 1, 'Master Bedroom Split AC', 'Daikin', 'FTKF50TV', 'DKN-2022-8841', '2022-04-10', '2022-04-12', '2024-03-15', 68, 'HIGH', 'Reduced cooling efficiency; slight vibration noise during peak compression', 'HEAVY', 'AC Deep Jet Cleaning & Sanitization', 'NEEDS_ATTENTION'),
            (2, 6, 4, 'Double Door Inverter Fridge', 'Samsung', 'RT34T4513S8', 'SMG-2021-0942', '2021-07-20', '2021-07-21', '2024-01-10', 88, 'LOW', 'Running smoothly; ice maker working as expected', 'MODERATE', 'Annual Condenser Coil Dusting', 'HEALTHY'),
            (3, 6, 5, 'Front Load Washing Machine 8kg', 'LG', 'FHM1208ZDL', 'LGE-2020-5519', '2020-09-05', '2020-09-06', '2023-11-20', 54, 'CRITICAL', 'Excessive rattling on spin cycle, drainage water draining unusually slow', 'HEAVY', 'Washing Machine Drum & Motor Service', 'CRITICAL'),
            (4, 7, 6, 'Multi-Stage RO Water Purifier', 'Kent', 'Grand Plus Mineral', 'KNT-2023-1102', '2023-01-15', '2023-01-16', '2024-02-01', 72, 'MEDIUM', 'TDS reading has risen from 45 to 110 ppm; flow rate moderately decreased', 'MODERATE', 'RO Complete Filter & Membrane Overhaul', 'NEEDS_ATTENTION')
        """)

        # Bookings
        cur.execute("""
            INSERT IGNORE INTO bookings (id, booking_reference, customer_id, service_id, address_id, appliance_id, status, booking_date, time_slot, customer_notes, estimated_price, final_price, payment_status, created_at) VALUES
            (1, 'BF-2026-9001', 6, 1, 1, 1, 'COMPLETED', '2026-11-01', '10:00 AM - 12:00 PM', 'Please inspect the reduced cooling rate in the master bedroom AC.', 599.00, 699.00, 'PAID', '2026-10-30 09:15:00'),
            (2, 'BF-2026-9002', 6, 9, 1, 3, 'IN_PROGRESS', '2026-11-08', '02:00 PM - 04:00 PM', 'Spin cycle making loud clattering sounds; urgent attention needed.', 749.00, 850.00, 'PENDING', '2026-11-07 14:20:00'),
            (3, 'BF-2026-9003', 7, 10, 3, 4, 'TECHNICIAN_ASSIGNED', '2026-11-09', '11:00 AM - 01:00 PM', 'Water tastes slightly salty; TDS reading has climbed past 100.', 1499.00, 1499.00, 'PENDING', '2026-11-08 08:30:00'),
            (4, 'BF-2026-9004', 8, 4, 4, NULL, 'CONFIRMED', '2026-11-10', '04:00 PM - 06:00 PM', 'Living room 16A AC socket is sparking and tripped the main MCB switch.', 299.00, 299.00, 'PAID', '2026-11-08 11:10:00')
        """)

        # Technician assignments
        cur.execute("""
            INSERT IGNORE INTO technician_assignments (id, booking_id, technician_id, status, matching_score, match_reasons, assigned_at, accepted_at, completed_at) VALUES
            (1, 1, 1, 'COMPLETED', 96.50, 'Matched: Category HVAC (100%), Proximity 3.8 km (95%), 4.92 Rating (98%), Available slot (100%)', '2026-10-30 09:30:00', '2026-10-30 09:35:00', '2026-11-01 11:45:00'),
            (2, 2, 4, 'ACCEPTED', 94.20, 'Matched: Front-load drum specialist (100%), 9 yrs experience (95%), Proximity 5.1 km (88%)', '2026-11-07 14:30:00', '2026-11-07 14:40:00', NULL),
            (3, 3, 3, 'PROPOSED', 91.80, 'Matched: RO membrane expertise (100%), Dwarka/Noida coverage (85%), 4.95 Rating (99%)', '2026-11-08 08:45:00', NULL, NULL)
        """)

        # Payments
        cur.execute("""
            INSERT IGNORE INTO payments (id, booking_id, customer_id, transaction_ref, amount, payment_method, status, payment_gateway_mode, gateway_response, created_at) VALUES
            (1, 1, 6, 'TXN-BF-20261101-4401', 699.00, 'UPI', 'COMPLETED', 'DEMO_SANDBOX', '{"gateway": "ByteForce_Simulated_UPI", "vpa": "rahul@okhdfcbank", "status": "SUCCESS"}', '2026-11-01 11:50:00'),
            (2, 4, 8, 'TXN-BF-20261108-9921', 299.00, 'CARD', 'COMPLETED', 'DEMO_SANDBOX', '{"gateway": "ByteForce_Simulated_Card", "card_brand": "Visa", "last4": "4242", "status": "SUCCESS"}', '2026-11-08 11:15:00')
        """)

        # Reviews
        cur.execute("""
            INSERT IGNORE INTO reviews (id, booking_id, customer_id, technician_id, rating, cleanliness_rating, punctuality_rating, quality_rating, review_text, created_at) VALUES
            (1, 1, 6, 1, 5.0, 5, 5, 5, 'Rajesh arrived precisely on time with specialized jet pressure equipment. After the jet cleaning, my room cools down within 10 minutes! Highly professional and tidy work.', '2026-11-01 12:30:00')
        """)

        # Notifications
        cur.execute("""
            INSERT IGNORE INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at) VALUES
            (1, 6, 'Home Health Alert: AC Inspection Recommended', 'Your Daikin Split AC health score dropped to 68/100 due to heavy summer usage. Schedule proactive inspection to prevent cooling breakdown.', 'MAINTENANCE', 0, '/appliances', '2026-11-07 08:00:00'),
            (2, 6, 'Technician En Route', 'Vikram Singh is currently navigating to your address for Washing Machine Drum & Motor Service.', 'BOOKING', 0, '/bookings/2', '2026-11-08 13:45:00'),
            (3, 2, 'New 5-Star Review Received', 'Customer Rahul Verma left a 5.0 rating for AC Deep Jet Cleaning.', 'SYSTEM', 1, '/technician/reviews', '2026-11-01 12:35:00'),
            (4, 1, 'System Health Normal', 'All 4 AI predictive engines operating at 99.8% uptime.', 'SYSTEM', 0, '/admin/analytics', '2026-11-08 09:00:00')
        """)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        pwd = sys.argv[2] if len(sys.argv) > 2 else os.getenv("DB_PASS")
        if not pwd:
            pwd = getpass.getpass("Enter Aiven MySQL password: ")
        check_database(pwd)
    else:
        pwd = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DB_PASS")
        if not pwd:
            pwd = getpass.getpass("Enter Aiven MySQL password: ")
        migrate_database(pwd)

