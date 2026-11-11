import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.0.113:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bf_token');
      localStorage.removeItem('bf_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Services
export const serviceAPI = {
  getCategories: () => api.get('/categories'),
  getServices: (params?: any) => api.get('/services', { params }),
  getServiceById: (id: number) => api.get(`/services/${id}`),
};

// Bookings
export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id: number) => api.get(`/bookings/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/bookings/${id}/status`, { status }),
  cancel: (id: number) => api.put(`/bookings/${id}/status`, { status: 'cancelled' }),
  getTrustReport: (id: number) => api.get(`/bookings/${id}/trust-report`),
};

// Appliances
export const applianceAPI = {
  getAll: () => api.get('/appliances'),
  create: (data: any) => api.post('/appliances', data),
  update: (id: number, data: any) => api.put(`/appliances/${id}`, data),
  delete: (id: number) => api.delete(`/appliances/${id}`),
  getHealth: (id: number) => api.get(`/appliances/${id}/health`),
  addMaintenance: (id: number, data: any) => api.post(`/appliances/${id}/maintenance`, data),
};

// AI
export const aiAPI = {
  diagnose: (description: string) => api.post('/ai/diagnose', { description }),
  estimatePrice: (data: any) => api.post('/ai/estimate-price', data),
  predictSatisfaction: (data: any) => api.post('/ai/predict-satisfaction', data),
  predictMaintenance: (data: any) => api.post('/ai/predict-maintenance', data),
};

// Technician
export const technicianAPI = {
  getDashboard: () => api.get('/technician/dashboard'),
  toggleAvailability: () => api.post('/technician/availability'),
  updateBookingStatus: (id: number, status: string, notes?: string) => 
    api.put(`/bookings/${id}/status`, { status, notes }),
  uploadEvidence: (bookingId: number, formData: FormData) => 
    api.post(`/technician/evidence/${bookingId}`, formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }),
};

// Admin
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (role?: string) => api.get('/admin/users', { params: { role } }),
  updateUserStatus: (id: number, status: string) => api.put(`/admin/users/${id}`, { status }),
  getComplaints: () => api.get('/admin/complaints'),
  updateComplaint: (id: number, data: any) => api.put(`/admin/complaints/${id}`, data),
};

// Payments
export const paymentAPI = {
  process: (data: any) => api.post('/payments', data),
  getHistory: () => api.get('/payments'),
};

// Reviews
export const reviewAPI = {
  create: (data: any) => api.post('/reviews', data),
  getForBooking: (bookingId: number) => api.get(`/reviews/booking/${bookingId}`),
};

export default api;
