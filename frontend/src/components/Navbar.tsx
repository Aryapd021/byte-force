import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Wrench, Brain, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setDropdownOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/services', label: 'Services', icon: Wrench },
    { to: '/ai-diagnosis', label: 'AI Diagnosis', icon: Brain },
  ];

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'technician') return '/technician/dashboard';
    return '/dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BF</span>
            </div>
            <span className="font-bold text-lg text-primary">
              Byte<span className="text-secondary">Force</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.to
                    ? 'bg-secondary-50 text-secondary'
                    : 'text-primary-600 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-primary-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-primary-400" />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-primary">{user.name}</p>
                        <p className="text-xs text-primary-400 capitalize">{user.role}</p>
                      </div>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-gray-50">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 w-full text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-secondary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                  location.pathname === link.to ? 'bg-secondary-50 text-secondary' : 'text-primary-600'
                )}>
                  <link.icon className="w-5 h-5" /> {link.label}
                </Link>
              ))}
              {isAuthenticated && user ? (
                <>
                  <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-600">
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-600">
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error w-full">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="flex-1 text-center py-2.5 border border-secondary text-secondary rounded-xl text-sm font-semibold">Login</Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
