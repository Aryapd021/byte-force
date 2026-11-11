import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import ServiceList from './pages/services/ServiceList';
import ServiceDetail from './pages/services/ServiceDetail';
import BookingCreate from './pages/bookings/BookingCreate';
import BookingList from './pages/bookings/BookingList';
import BookingDetail from './pages/bookings/BookingDetail';
import AIDiagnosis from './pages/ai/AIDiagnosis';
import ApplianceList from './pages/appliances/ApplianceList';
import ApplianceHealth from './pages/appliances/ApplianceHealth';
import Profile from './pages/Profile';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* Customer */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/bookings/new/:serviceId" element={<BookingCreate />} />
          <Route path="/appliances" element={<ApplianceList />} />
          <Route path="/appliances/:id/health" element={<ApplianceHealth />} />
        </Route>

        {/* Customer + Technician */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'technician', 'admin']} />}>
          <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Technician */}
        <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
