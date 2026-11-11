import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-primary-500 text-center max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 btn-primary text-sm">{actionLabel}</button>
      )}
    </div>
  );
}
