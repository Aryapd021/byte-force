import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-primary mb-2">Page Not Found</h1>
        <p className="text-primary-500 mb-8 max-w-md">Oops! The page you're looking for doesn't exist. It might have been moved or deleted.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2"><Home className="w-5 h-5" /> Go Home</Link>
          <Link to="/services" className="btn-secondary flex items-center gap-2"><Search className="w-5 h-5" /> Browse Services</Link>
        </div>
      </motion.div>
    </div>
  );
}
