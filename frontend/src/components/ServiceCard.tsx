import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee } from 'lucide-react';

interface ServiceCardProps {
  id: number;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  category_name?: string;
}

export default function ServiceCard({ id, name, description, base_price, duration_minutes, category_name }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div className="h-36 bg-gradient-to-br from-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
          <span className="text-2xl">🔧</span>
        </div>
      </div>
      <div className="p-5">
        {category_name && (
          <span className="text-xs font-medium text-accent bg-accent-50 px-2 py-1 rounded-full">{category_name}</span>
        )}
        <h3 className="text-lg font-semibold text-primary mt-2 mb-1">{name}</h3>
        <p className="text-sm text-primary-500 line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-secondary font-semibold">
            <IndianRupee className="w-4 h-4" />
            <span>{base_price}</span>
          </div>
          <div className="flex items-center gap-1 text-primary-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{duration_minutes} mins</span>
          </div>
        </div>
        <Link
          to={`/services/${id}`}
          className="block w-full text-center py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary-700 transition-colors"
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}
