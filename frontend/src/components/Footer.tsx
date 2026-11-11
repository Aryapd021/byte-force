import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BF</span>
              </div>
              <span className="font-bold text-lg">Byte<span className="text-accent">Force</span></span>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed">
              Smart Homes. Smarter Services. AI-powered home services platform for modern living.
            </p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Services' },
                { to: '/ai-diagnosis', label: 'AI Diagnosis' },
                { to: '/appliances', label: 'HomeCare Passport' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-300 text-sm hover:text-accent transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-primary-300 text-sm hover:text-accent transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-300 text-sm">
                <Mail className="w-4 h-4 text-accent" /> support@byteforce.in
              </li>
              <li className="flex items-center gap-2 text-primary-300 text-sm">
                <Phone className="w-4 h-4 text-accent" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-primary-300 text-sm">
                <MapPin className="w-4 h-4 text-accent" /> Bangalore, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-400 text-sm">&copy; 2024 Byte Force. All rights reserved.</p>
          <p className="text-primary-400 text-sm">Made with ❤️ by Byte Force Team</p>
        </div>
      </div>
    </footer>
  );
}
