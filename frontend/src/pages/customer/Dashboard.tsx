import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI, applianceAPI } from '@/services/api';
import { Calendar, Package, Shield, Activity, Plus, Brain, Wrench, ArrowRight } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [appliances, setAppliances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, aRes] = await Promise.all([
          bookingAPI.getAll().catch(() => ({ data: { bookings: [] } })),
          applianceAPI.getAll().catch(() => ({ data: { appliances: [] } })),
        ]);
        setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data?.bookings || []);
        setAppliances(Array.isArray(aRes.data) ? aRes.data : aRes.data?.appliances || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;

  const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'assigned', 'in_progress'].includes(b.status));
  const avgHealth = appliances.length > 0
    ? Math.round(appliances.reduce((s, a) => s + (a.health_score || 75), 0) / appliances.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-primary mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-primary-500 mb-6">Here's your home services overview</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard icon={Calendar} label="Total Bookings" value={bookings.length} color="from-secondary to-blue-400" />
            <StatsCard icon={Activity} label="Active Bookings" value={activeBookings.length} color="from-orange-500 to-amber-500" />
            <StatsCard icon={Package} label="Appliances" value={appliances.length} color="from-purple-500 to-pink-500" />
            <StatsCard icon={Shield} label="Home Health" value={appliances.length > 0 ? `${avgHealth}/100` : 'N/A'} color="from-green-500 to-emerald-500" />
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/services" className="btn-primary text-sm flex items-center gap-2"><Wrench className="w-4 h-4" /> Book Service</Link>
            <Link to="/ai-diagnosis" className="btn-secondary text-sm flex items-center gap-2"><Brain className="w-4 h-4" /> AI Diagnosis</Link>
            <Link to="/appliances" className="btn-accent text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Appliance</Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">Recent Bookings</h2>
                <Link to="/bookings" className="text-sm text-secondary font-medium flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
              </div>
              {bookings.length === 0 ? (
                <p className="text-primary-400 text-sm py-8 text-center">No bookings yet. Book your first service!</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((b: any) => (
                    <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-primary">{b.service_name || `Service #${b.service_id}`}</p>
                        <p className="text-xs text-primary-400">{b.scheduled_date} · {b.scheduled_time}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">Registered Appliances</h2>
                <Link to="/appliances" className="text-sm text-secondary font-medium flex items-center gap-1">Manage <ArrowRight className="w-4 h-4" /></Link>
              </div>
              {appliances.length === 0 ? (
                <p className="text-primary-400 text-sm py-8 text-center">No appliances registered. Add your first appliance!</p>
              ) : (
                <div className="space-y-3">
                  {appliances.slice(0, 5).map((a: any) => {
                    const score = a.health_score || 75;
                    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <Link key={a.id} to={`/appliances/${a.id}/health`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-primary">{a.name}</p>
                          <p className="text-xs text-primary-400">{a.brand} · {a.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs font-medium text-primary-600">{score}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
