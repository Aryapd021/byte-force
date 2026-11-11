import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { applianceAPI } from '@/services/api';
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, Plus, RefreshCw, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

export default function ApplianceHealth() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appliance, setAppliance] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ service_type: '', description: '', cost: '', performed_date: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, hRes] = await Promise.all([
          applianceAPI.getAll(),
          applianceAPI.getHealth(Number(id)).catch(() => null),
        ]);
        const list = Array.isArray(aRes.data) ? aRes.data : aRes.data?.appliances || [];
        const found = list.find((a: any) => a.id === Number(id));
        setAppliance(found);
        if (hRes?.data) setHealth(hRes.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await applianceAPI.getHealth(Number(id));
      setHealth(res.data);
      toast.success('Health prediction updated!');
    } catch { toast.error('Failed to refresh'); }
    setRefreshing(false);
  };

  const handleAddMaintenance = async () => {
    try {
      await applianceAPI.addMaintenance(Number(id), {
        ...maintenanceForm,
        cost: Number(maintenanceForm.cost) || 0,
      });
      toast.success('Maintenance record added!');
      setShowMaintenance(false);
      setMaintenanceForm({ service_type: '', description: '', cost: '', performed_date: '' });
    } catch { toast.error('Failed to add record'); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!appliance) return <div className="min-h-screen flex items-center justify-center pt-16"><p>Appliance not found</p></div>;

  const score = health?.health_score || appliance.health_score || 75;
  const riskLevel = health?.risk_level || appliance.risk_level || 'medium';
  const riskColor = riskLevel === 'low' ? 'text-green-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600';
  const strokeColor = score >= 80 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500 hover:text-primary mb-6">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="card mb-6">
            <h1 className="text-xl font-bold text-primary mb-1">{appliance.name}</h1>
            <p className="text-primary-400 text-sm">{appliance.brand} · {appliance.model} · {appliance.category}</p>
            {appliance.purchase_date && <p className="text-xs text-primary-400 mt-1">Purchased: {appliance.purchase_date}</p>}
          </div>

          <div className="card mb-6 flex items-center gap-8">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                  stroke={strokeColor} strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">{score}</span>
            </div>
            <div>
              <p className="text-sm text-primary-500">Health Score</p>
              <p className="text-3xl font-bold text-primary">{score}/100</p>
              <p className={`text-sm font-medium capitalize mt-1 ${riskColor}`}>
                <AlertTriangle className="inline w-4 h-4 mr-1" />{riskLevel} Risk
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={handleRefresh} disabled={refreshing} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Prediction
            </button>
            <button onClick={() => setShowMaintenance(true)} className="btn-secondary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Maintenance
            </button>
          </div>

          {health?.predicted_issues?.length > 0 && (
            <div className="card mb-4">
              <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Predicted Issues
              </h2>
              <ul className="space-y-2">
                {health.predicted_issues.map((issue: string, i: number) => (
                  <li key={i} className="text-sm text-primary-600 flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {health?.recommendations?.length > 0 && (
            <div className="card mb-4">
              <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Recommendations
              </h2>
              <ul className="space-y-2">
                {health.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-primary-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Modal isOpen={showMaintenance} onClose={() => setShowMaintenance(false)} title="Add Maintenance Record">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Service Type</label>
                <input value={maintenanceForm.service_type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, service_type: e.target.value })} placeholder="e.g., General Service" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Description</label>
                <textarea value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} placeholder="What was done..." className="input-field h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Cost (₹)</label>
                  <input type="number" value={maintenanceForm.cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })} placeholder="500" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Date</label>
                  <input type="date" value={maintenanceForm.performed_date} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_date: e.target.value })} className="input-field" />
                </div>
              </div>
              <button onClick={handleAddMaintenance} className="btn-primary w-full">Add Record</button>
            </div>
          </Modal>
        </motion.div>
      </div>
    </div>
  );
}
