import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviceAPI, bookingAPI } from '@/services/api';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function BookingCreate() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    scheduled_date: '', scheduled_time: '',
    address_line: '', city: '', state: 'Karnataka', pincode: '',
    notes: '',
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await serviceAPI.getServiceById(Number(serviceId));
        setService(res.data?.service || res.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    if (serviceId) fetchService();
    else setLoading(false);
  }, [serviceId]);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await bookingAPI.create({
        service_id: Number(serviceId),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        address: form.address_line,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        notes: form.notes,
      });
      toast.success('Booking created successfully!');
      const bookingId = res.data?.booking?.id || res.data?.id;
      navigate(bookingId ? `/bookings/${bookingId}` : '/bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500 hover:text-primary mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <h1 className="text-2xl font-bold text-primary mb-6">Book Service</h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            {['Service', 'Details', 'Confirm'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-secondary text-white' : 'bg-gray-200 text-primary-400'}`}>
                  {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${step === i + 1 ? 'text-secondary' : 'text-primary-400'}`}>{label}</span>
                {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="card">
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-4">Selected Service</h2>
                {service ? (
                  <div className="p-4 bg-secondary-50 rounded-xl mb-4">
                    <h3 className="font-semibold text-primary">{service.name}</h3>
                    <p className="text-sm text-primary-500 mt-1">{service.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-primary-600">
                      <span>₹{service.base_price}</span>
                      <span>{service.duration_minutes} mins</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-primary-400">No service selected</p>
                )}
                <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2 mt-4">
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-primary">Schedule & Address</h2>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">
                    <Calendar className="inline w-4 h-4 mr-1" /> Date *
                  </label>
                  <input type="date" min={today} value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">
                    <Clock className="inline w-4 h-4 mr-1" /> Time Slot *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((t) => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, scheduled_time: t })}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${form.scheduled_time === t ? 'bg-secondary text-white' : 'bg-gray-100 text-primary-600 hover:bg-gray-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">
                    <MapPin className="inline w-4 h-4 mr-1" /> Address *
                  </label>
                  <input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} placeholder="Street address" className="input-field mb-2" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input-field" />
                    <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="input-field" />
                    <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Notes (optional)</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." className="input-field h-24 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button onClick={() => { if (!form.scheduled_date || !form.scheduled_time || !form.address_line) { toast.error('Please fill required fields'); return; } setStep(3); }} className="btn-primary flex items-center gap-2">
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-4">Confirm Booking</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-primary-500">Service</span>
                    <span className="font-medium">{service?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-primary-500">Date</span>
                    <span className="font-medium">{form.scheduled_date}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-primary-500">Time</span>
                    <span className="font-medium">{form.scheduled_time}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-primary-500">Address</span>
                    <span className="font-medium text-right">{form.address_line}, {form.city}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-secondary-50 rounded-xl px-4">
                    <span className="font-semibold text-primary">Estimated Total</span>
                    <span className="font-bold text-secondary text-lg">₹{service?.base_price || 0}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Confirm Booking</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
