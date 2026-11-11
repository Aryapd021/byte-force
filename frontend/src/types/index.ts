export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'technician' | 'admin';
  phone?: string;
  avatar?: string;
  status?: string;
  created_at?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url?: string;
}

export interface Service {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  image_url?: string;
  is_active: boolean;
}

export interface Booking {
  id: number;
  customer_id: number;
  service_id: number;
  service_name?: string;
  technician_id?: number;
  technician_name?: string;
  address_id?: number;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  address_line?: string;
  city?: string;
}

export interface Appliance {
  id: number;
  customer_id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  purchase_date: string;
  installation_date?: string;
  warranty_end_date?: string;
  health_score?: number;
  risk_level?: string;
  last_service_date?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: number;
  appliance_id: number;
  service_type: string;
  description: string;
  performed_by?: string;
  cost: number;
  performed_date: string;
}

export interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  technician_id: number;
  rating: number;
  review_text?: string;
  created_at: string;
}

export interface Address {
  id: number;
  customer_id: number;
  label: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
}

export interface AIdiagnosis {
  category: string;
  confidence: number;
  possible_issues: string[];
  recommended_services: string[];
  urgency: string;
  troubleshooting_steps: string[];
  disclaimer: string;
}

export interface PriceEstimate {
  estimated_price: number;
  price_range: { min: number; max: number };
  factors: string[];
  confidence: number;
}

export interface ApplianceHealth {
  health_score: number;
  risk_level: string;
  predicted_issues: string[];
  recommendations: string[];
  next_service_date: string;
}

export interface AdminAnalytics {
  total_customers: number;
  total_technicians: number;
  total_bookings: number;
  total_revenue: number;
  pending_bookings: number;
  completed_bookings: number;
  avg_rating: number;
  monthly_revenue: { month: string; revenue: number }[];
  popular_services: { name: string; count: number }[];
  booking_status_distribution: { status: string; count: number }[];
}
