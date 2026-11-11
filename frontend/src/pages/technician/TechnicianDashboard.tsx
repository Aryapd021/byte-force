import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { technicianAPI, bookingAPI } from '@/services/api';
import { ToggleLeft, ToggleRight, Briefcase, CheckCircle, Star, IndianRupee, Play, XCircle } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingAPI.getAll();
        setBookings(Array.isArray(res.data) ? res.data : res.data?.bookings || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleAvailability = async () => {
    try {
      await technicianAPI.toggleAvailability();
      setAvailable(!available);
      toast.success(available ? 'You are now unavailable' : 'You are now available');
    } catch { toast.error('Failed to toggle availability'); }
  };

  const updateStatus = async (bookingId: number, status: string) => {
    setActionLoading(bookingId);
    try {
      await technicianAPI.updateBookingStatus(bookingId, status);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch { toast.error('Failed to update status'); }
    setActionLoading(null);
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;

  const activeJobs = bookings.filter(b => ['assigned', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedJobs.reduce((s, b) => s + (b.total_amount || b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome, {user?.name?.split(' ')[0]}! 🔧</h1>
              <p className="text-primary-500 text-sm">Technician Dashboard</p>
            </div>
            <button onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {available ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              {available ? 'Available' : 'Unavailable'}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard icon={Briefcase} label="Active Jobs" value={activeJobs.length} color="from-blue-500 to-blue-600" />
            <StatsCard icon={CheckCircle} label="Completed" value={completedJobs.length} color="from-green-500 to-green-600" />
            <StatsCard icon={Star} label="Rating" value="4.5" color="from-yellow-500 to-orange-500" />
            <StatsCard icon={IndianRupee} label="Earnings" value={`₹${totalEarnings}`} color="from-purple-500 to-pink-500" />
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Active Jobs</h2>
            {activeJobs.length === 0 ? (
              <p className="text-primary-400 text-sm text-center py-8">No active jobs at the moment.</p>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-primary">{b.service_name || `Service #${b.service_id}`}</p>
                      <p className="text-sm text-primary-400">{b.scheduled_date} · {b.scheduled_time}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex gap-2">
                      {b.status === 'assigned' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'in_progress')} disabled={actionLoading === b.id}
                            className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1 disabled:opacity-50">
                            <Play className="w-4 h-4" /> Accept
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={actionLoading === b.id}
                            className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 flex items-center gap-1 disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      {b.status === 'in_progress' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} disabled={actionLoading === b.id}
                          className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1 disabled:opacity-50">
                          <CheckCircle className="w-4 h-4" /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4">Completed Jobs</h2>
            {completedJobs.length === 0 ? (
              <p className="text-primary-400 text-sm text-center py-8">No completed jobs yet.</p>
            ) : (
              <div className="space-y-2">
                {completedJobs.slice(0, 10).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-primary">{b.service_name || `Service #${b.service_id}`}</p>
                      <p className="text-xs text-primary-400">{b.scheduled_date}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₹{b.total_amount || b.amount || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
