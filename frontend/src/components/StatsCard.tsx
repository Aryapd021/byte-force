import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  color?: string;
}

export default function StatsCard({ icon: Icon, label, value, trend, color = 'from-secondary to-blue-400' }: StatsCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-primary-500 mt-0.5">{label}</p>
    </motion.div>
  );
}
