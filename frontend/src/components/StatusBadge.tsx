import { cn } from '@/utils/cn';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
  assigned: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Assigned' },
  in_progress: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full capitalize',
      config.bg, config.text,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {config.label}
    </span>
  );
}
