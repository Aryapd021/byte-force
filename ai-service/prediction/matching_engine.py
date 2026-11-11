import math
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class TechnicianMatchingEngine:
    """
    Intelligent Multi-Factor Technician Allocation Engine
    Calculates weighted ranking:
    1. Skill & Category Match: 40%
    2. Proximity / Distance: 25%
    3. Rating & Historical Satisfaction: 20%
    4. Current Workload & Availability: 15%
    """

    def rank_technicians(self, category_slug: str, cust_lat: float, cust_lon: float,
                         technicians: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        ranked = []

        for tech in technicians:
            # 1. Skill Match (Max 40 points)
            skills = tech.get("skills", [])
            has_direct_skill = any(category_slug in s.lower() or s.lower() in category_slug for s in skills)
            skill_score = 40.0 if has_direct_skill else 15.0

            # 2. Distance Calculation (Max 25 points)
            tech_lat = float(tech.get("latitude", 28.6139))
            tech_lon = float(tech.get("longitude", 77.2090))
            dist_km = haversine_distance(cust_lat, cust_lon, tech_lat, tech_lon)

            # Score decreases with distance (within 5km = 25 pts, 25km = 5 pts)
            dist_score = max(5.0, 25.0 - (dist_km * 0.8))

            # 3. Rating Score (Max 20 points)
            rating = float(tech.get("rating", 4.5))
            rating_score = (rating / 5.0) * 20.0

            # 4. Workload & Availability (Max 15 points)
            is_avail = tech.get("is_available", True)
            active_jobs = int(tech.get("active_jobs", 0))
            if not is_avail:
                workload_score = 0.0
            else:
                workload_score = max(2.0, 15.0 - (active_jobs * 3.5))

            total_score = round(skill_score + dist_score + rating_score + workload_score, 1)

            # Build explainability breakdown
            reasons = []
            if has_direct_skill:
                reasons.append(f"Certified expert in {category_slug.replace('-', ' ').title()}")
            reasons.append(f"{dist_km:.1f} km away (~{int(dist_km * 3.5 + 10)} min travel)")
            reasons.append(f"{rating:.2f}★ rating across {tech.get('completed_jobs', 50)}+ bookings")
            if active_jobs == 0:
                reasons.append("Currently available for immediate dispatch")
            else:
                reasons.append(f"Only {active_jobs} ongoing job in queue")

            ranked.append({
                "technician_id": tech.get("id"),
                "technician_name": tech.get("name"),
                "matching_score": total_score,
                "distance_km": round(dist_km, 2),
                "rating": rating,
                "experience_years": tech.get("experience_years", 3),
                "active_jobs": active_jobs,
                "is_available": is_avail,
                "reasons": reasons,
                "explanation": f"Matched with {total_score}% compatibility. Top factor: {reasons[0]}, {reasons[1]}."
            })

        # Sort highest matching score first
        ranked.sort(key=lambda x: x["matching_score"], reverse=True)
        return ranked
