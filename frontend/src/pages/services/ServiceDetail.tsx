import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviceAPI, aiAPI } from '@/services/api';
import { Clock, IndianRupee, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';

export default function ServiceDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priceModal, setPriceModal] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await serviceAPI.getServiceById(Number(id));
        setService(res.data?.service || res.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchService();
  }, [id]);

  const handleEstimatePrice = async () => {
    setEstimating(true);
    setPriceModal(true);
    try {
      const res = await aiAPI.estimatePrice({
        service_category: service.category_name || 'general',
        problem_type: service.name,
        complexity: 'medium',
        location: 'urban',
      });
      setPriceEstimate(res.data);
    } catch {
      setPriceEstimate({ estimated_price: service.base_price, price_range: { min: service.base_price * 0.8, max: service.base_price * 1.5 } });
    }
    setEstimating(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!service) return <div className="min-h-screen flex items-center justify-center pt-16"><p>Service not found</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500 hover:text-primary mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="bg-gradient-to-br from-secondary to-accent rounded-2xl p-8 text-white mb-6">
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{service.category_name || 'Service'}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{service.name}</h1>
            <div className="flex items-center gap-6 text-white/80">
              <span className="flex items-center gap-1"><IndianRupee className="w-5 h-5" /> {service.base_price}</span>
              <span className="flex items-center gap-1"><Clock className="w-5 h-5" /> {service.duration_minutes} mins</span>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-primary mb-3">About this service</h2>
            <p className="text-primary-600 leading-relaxed">{service.description || 'Professional home service delivered by verified technicians with guaranteed quality.'}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <Link to={`/bookings/new/${service.id}`} className="btn-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Book This Service
              </Link>
            ) : (
              <Link to="/login" className="btn-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Login to Book
              </Link>
            )}
            <button onClick={handleEstimatePrice} className="btn-secondary flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Get AI Price Estimate
            </button>
          </div>

          <Modal isOpen={priceModal} onClose={() => setPriceModal(false)} title="AI Price Estimate">
            {estimating ? (
              <LoadingSpinner text="Estimating price..." />
            ) : priceEstimate ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-primary-500 mb-1">Estimated Price</p>
                  <p className="text-3xl font-bold text-secondary">₹{Math.round(priceEstimate.estimated_price || priceEstimate.predicted_price || service.base_price)}</p>
                  <p className="text-sm text-primary-400 mt-1">
                    Range: ₹{Math.round(priceEstimate.price_range?.min || service.base_price * 0.8)} - ₹{Math.round(priceEstimate.price_range?.max || service.base_price * 1.5)}
                  </p>
                </div>
                <p className="text-xs text-primary-400 text-center">
                  * AI-predicted estimate. Actual price may vary based on inspection.
                </p>
              </div>
            ) : null}
          </Modal>
        </motion.div>
      </div>
    </div>
  );
}
