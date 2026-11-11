import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { serviceAPI } from '@/services/api';
import { Search } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ServiceList() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          serviceAPI.getServices(),
          serviceAPI.getCategories(),
        ]);
        setServices(Array.isArray(sRes.data) ? sRes.data : sRes.data?.services || []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : cRes.data?.categories || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = services.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || String(s.category_id) === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) return <LoadingSpinner fullScreen text="Loading services..." />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-primary mb-2">Our Services</h1>
          <p className="text-primary-500 mb-8">Browse and book from our wide range of home services</p>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-secondary text-white' : 'bg-white text-primary-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                All
              </button>
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(String(c.id))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${String(c.id) === activeCategory ? 'bg-secondary text-white' : 'bg-white text-primary-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s: any) => (
              <ServiceCard key={s.id} id={s.id} name={s.name} description={s.description} base_price={s.base_price} duration_minutes={s.duration_minutes} category_name={s.category_name} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-primary-400 text-lg">No services found matching your search.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
