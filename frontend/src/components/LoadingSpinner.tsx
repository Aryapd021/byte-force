import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ text, fullScreen, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  const spinner = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <div className={cn('border-4 border-gray-200 border-t-secondary rounded-full animate-spin', sizeClasses[size])} />
      {text && <p className="text-sm text-primary-500">{text}</p>}
    </motion.div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{spinner}</div>;
  }

  return spinner;
}
