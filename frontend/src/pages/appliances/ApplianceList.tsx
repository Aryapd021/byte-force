import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { applianceAPI } from '@/services/api';
import { Shield, Plus, Trash2, Activity, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

const categories = ['AC', 'Refrigerator', 'Washing Machine', 'Geyser', 'TV', 'Microwave', 'Air Purifier', 'Other'];

export default function ApplianceList() {
  const [appliances, setAppliances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'AC', brand: '', model: '', purchase_date: '', warranty_end_date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAppliances = async () => {
    try {
      const res = await applianceAPI.getAll();
      setAppliances(Array.isArray(res.data) ? res.data : res.data?.appliances || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAppliances(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.brand) { toast.error('Name and brand required'); return; }
    setSubmitting(true);
    try {
      await applianceAPI.create(form);
      toast.success('Appliance added!');
      setShowAdd(false);
      setForm({ name: '', category: 'AC', brand: '', model: '', purchase_date: '', warranty_end_date: '', notes: '' });
      fetchAppliances();
    } catch { toast.error('Failed to add appliance'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this appliance?')) return;
    try {
      await applianceAPI.delete(id);
      toast.success('Appliance deleted');
      setAppliances(appliances.filter(a => a.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const avgHealth = appliances.length > 0
    ? Math.round(appliances.reduce((s, a) => s + (a.health_score || 75), 0) / appliances.length) : 0;

  if (loading) return <LoadingSpinner fullScreen text="Loading appliances..." />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Shield className="w-6 h-6 text-secondary" /> HomeCare Passport
              </h1>
              <p className="text-primary-500 text-sm">Track and predict your appliance health</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Appliance
            </button>
          </div>

          {appliances.length > 0 && (
            <div className="card mb-6 flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                    stroke={avgHealth >= 80 ? '#16A34A' : avgHealth >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3" strokeDasharray={`${avgHealth}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">{avgHealth}</span>
              </div>
              <div>
                <p className="text-sm text-primary-500">Overall Home Health Score</p>
                <p className="text-2xl font-bold text-primary">{avgHealth}/100</p>
                <p className="text-xs text-primary-400">{appliances.length} appliance{appliances.length > 1 ? 's' : ''} registered</p>
              </div>
            </div>
          )}

          {appliances.length === 0 ? (
            <EmptyState icon={Shield} title="No appliances registered" description="Add your home appliances to start tracking their health and get predictive maintenance alerts." actionLabel="Add First Appliance" onAction={() => setShowAdd(true)} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {appliances.map((a: any) => {
                const score = a.health_score || 75;
                const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
                const bg = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <motion.div key={a.id} whileHover={{ y: -2 }} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-primary">{a.name}</h3>
                        <p className="text-sm text-primary-400">{a.brand} · {a.category}</p>
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-primary-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bg}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${color}`}>{score}/100</span>
                    </div>
                    {a.risk_level && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        a.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                        a.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      } capitalize`}>{a.risk_level} Risk</span>
                    )}
                    <Link to={`/appliances/${a.id}/health`} className="mt-3 flex items-center gap-1 text-sm text-secondary font-medium hover:underline">
                      <Activity className="w-4 h-4" /> Check Health
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Appliance">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Living Room AC" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Brand *</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g., Daikin" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Model</label>
                  <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g., FTKF50" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Warranty End</label>
                  <input type="date" value={form.warranty_end_date} onChange={(e) => setForm({ ...form, warranty_end_date: e.target.value })} className="input-field" />
                </div>
              </div>
              <button onClick={handleAdd} disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Appliance'}
              </button>
            </div>
          </Modal>
        </motion.div>
      </div>
    </div>
  );
}
