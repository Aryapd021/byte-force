import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI, reviewAPI } from '@/services/api';
import { ArrowLeft, Calendar, Clock, MapPin, User, IndianRupee, Shield, X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import RatingStars from '@/components/RatingStars';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });
  const [trustReport, setTrustReport] = useState<any>(null);
  const [trustModal, setTrustModal] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingAPI.getById(Number(id));
        setBooking(res.data?.booking || res.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    try {
      await bookingAPI.cancel(Number(id));
      toast.success('Booking cancelled');
      setBooking({ ...booking, status: 'cancelled' });
    } catch { toast.error('Failed to cancel'); }
  };

  const handleReview = async () => {
    try {
      await reviewAPI.create({ booking_id: Number(id), technician_id: booking.technician_id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(false);
    } catch { toast.error('Failed to submit review'); }
  };

  const handleTrustReport = async () => {
    setTrustModal(true);
    try {
      const res = await bookingAPI.getTrustReport(Number(id));
      setTrustReport(res.data);
    } catch { setTrustReport({ message: 'Trust report unavailable' }); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!booking) return <div className="min-h-screen flex items-center justify-center pt-16"><p>Booking not found</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500 hover:text-primary mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-primary">Booking #{booking.id}</h1>
              <StatusBadge status={booking.status} size="md" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-primary">{booking.service_name || `Service #${booking.service_id}`}</p>
                  <p className="text-xs text-primary-400">{booking.scheduled_date} at {booking.scheduled_time}</p>
                </div>
              </div>

              {booking.technician_name && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-primary">Technician: {booking.technician_name}</p>
                  </div>
                </div>
              )}

              {(booking.address_line || booking.address) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-primary">{booking.address_line || booking.address}{booking.city ? `, ${booking.city}` : ''}</p>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <IndianRupee className="w-5 h-5 text-secondary" />
                <p className="text-lg font-bold text-secondary">₹{booking.total_amount || booking.amount || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {booking.status === 'pending' && (
              <button onClick={handleCancel} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel Booking
              </button>
            )}
            {booking.status === 'completed' && (
              <button onClick={() => setReviewModal(true)} className="btn-primary text-sm flex items-center gap-2">Leave Review</button>
            )}
            <button onClick={handleTrustReport} className="btn-secondary text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> FairFix Trust Report
            </button>
          </div>

          <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Leave a Review">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Rating</label>
                <RatingStars rating={reviewForm.rating} interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Your Review</label>
                <textarea value={reviewForm.review_text} onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })} placeholder="Share your experience..." className="input-field h-24 resize-none" />
              </div>
              <button onClick={handleReview} className="btn-primary w-full">Submit Review</button>
            </div>
          </Modal>

          <Modal isOpen={trustModal} onClose={() => setTrustModal(false)} title="FairFix Trust Report" maxWidth="max-w-xl">
            {trustReport ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-sm text-green-600 font-medium">Transparency Score</p>
                  <p className="text-3xl font-bold text-green-700">{trustReport.transparency_score || trustReport.trust_score || 'N/A'}</p>
                </div>
                <p className="text-sm text-primary-500">{trustReport.summary || trustReport.message || 'This booking follows Byte Force fair pricing guidelines.'}</p>
                <p className="text-xs text-primary-400 italic">DEMO_SANDBOX: This is a demonstration trust report.</p>
              </div>
            ) : (
              <LoadingSpinner text="Loading trust report..." />
            )}
          </Modal>
        </motion.div>
      </div>
    </div>
  );
}
