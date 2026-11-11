import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '@/services/api';
import { Calendar, Package } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const tabs = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function BookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getAll();
        setBookings(Array.isArray(res.data) ? res.data : res.data?.bookings || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  if (loading) return <LoadingSpinner fullScreen text="Loading bookings..." />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-primary mb-6">My Bookings</h1>

          <div className="flex gap-2 flex-wrap mb-6">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-secondary text-white' : 'bg-white text-primary-600 border border-gray-200 hover:bg-gray-50'}`}>
                {tab === 'in_progress' ? 'In Progress' : tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Package} title="No bookings found" description="You haven't made any bookings yet." actionLabel="Browse Services" onAction={() => window.location.href = '/services'} />
          ) : (
            <div className="space-y-3">
              {filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((b: any) => (
                <Link key={b.id} to={`/bookings/${b.id}`}>
                  <motion.div whileHover={{ x: 4 }} className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{b.service_name || `Booking #${b.id}`}</p>
                        <p className="text-sm text-primary-400">{b.scheduled_date} · {b.scheduled_time}</p>
                        {b.technician_name && <p className="text-xs text-primary-400">Tech: {b.technician_name}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={b.status} />
                      <p className="text-sm font-semibold text-primary mt-1">₹{b.total_amount || b.amount || 0}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
