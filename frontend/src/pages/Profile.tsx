import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-primary mb-6">My Profile</h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-primary-500">{user.email}</span>
                  <span className="px-2 py-0.5 bg-secondary-50 text-secondary text-xs font-medium rounded-full capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input value={user.email} disabled className="input-field pl-10 bg-gray-50 text-primary-400 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-field pl-10" />
                </div>
              </div>

              <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
