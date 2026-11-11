import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench, Zap, Wind, Paintbrush, Shield, Cog,
  Brain, IndianRupee, ClipboardCheck, Search,
  ArrowRight, Star, CheckCircle, Users, Home, Sparkles
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  { icon: Wrench, name: 'Plumbing', price: '₹199', color: 'from-blue-500 to-blue-600' },
  { icon: Zap, name: 'Electrical', price: '₹249', color: 'from-yellow-500 to-orange-500' },
  { icon: Wind, name: 'AC Service', price: '₹399', color: 'from-cyan-500 to-blue-500' },
  { icon: Paintbrush, name: 'Painting', price: '₹999', color: 'from-purple-500 to-pink-500' },
  { icon: Shield, name: 'Security', price: '₹599', color: 'from-green-500 to-emerald-600' },
  { icon: Cog, name: 'Appliance Repair', price: '₹299', color: 'from-red-500 to-rose-600' },
];

const aiFeatures = [
  { icon: Brain, title: 'Smart Diagnosis', desc: 'Describe your problem in plain language. Our AI identifies the issue, recommends the right service, and estimates costs.' },
  { icon: IndianRupee, title: 'Fair Pricing', desc: 'ML-predicted transparent pricing. No hidden charges, no surprises. Know the cost before you book.' },
  { icon: ClipboardCheck, title: 'HomeCare Passport', desc: 'Register your appliances, track health scores, and get predictive maintenance alerts before breakdowns happen.' },
];

const steps = [
  { num: '01', title: 'Describe Your Problem', desc: 'Tell our AI what\'s wrong in simple words.' },
  { num: '02', title: 'Get AI Recommendations', desc: 'Receive smart diagnosis, pricing, and service matches.' },
  { num: '03', title: 'Book a Technician', desc: 'Choose your slot and get a verified professional.' },
  { num: '04', title: 'Sit Back & Relax', desc: 'Track progress and pay securely on completion.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Homeowner, Delhi', rating: 5, text: 'The AI diagnosis accurately identified my AC issue. The technician arrived on time and fixed it in under an hour. Truly impressive!' },
  { name: 'Rajesh Kumar', role: 'Apartment Owner, Bangalore', rating: 5, text: 'HomeCare Passport saved me from a potential water heater failure. The predictive maintenance alert came just in time.' },
  { name: 'Ananya Patel', role: 'Villa Owner, Mumbai', rating: 4, text: 'Fair pricing is a game-changer. I can see exactly how the cost is calculated. No more surprise charges from service providers.' },
];

export default function Landing() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="text-white">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>AI-Powered Home Services</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Smart Homes.{' '}
                <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  Smarter Services.
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-primary-300 mb-8 max-w-lg">
                Experience the future of home maintenance with AI-driven diagnosis, fair pricing, predictive maintenance, and verified technicians.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                <Link to="/services" className="px-8 py-3.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-700 transition-all shadow-lg shadow-secondary/25 flex items-center gap-2">
                  Book a Service <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/ai-diagnosis" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Try AI Diagnosis
                </Link>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/30 rounded-3xl rotate-6" />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Home className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-3xl font-bold">HomeGenie</p>
                    <p className="text-sm opacity-70 mt-1">AI Intelligence</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Homes Served' },
              { value: '500+', label: 'Verified Technicians' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '₹0', label: 'Hidden Charges' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-primary-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Popular Services</h2>
            <p className="text-primary-500 max-w-2xl mx-auto">From plumbing to electrical, our verified professionals handle it all with guaranteed quality.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Link to="/services" className="block bg-white rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md transition-all">
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary text-sm mb-1">{service.name}</h3>
                  <p className="text-xs text-primary-500">From {service.price}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Powered by <span className="gradient-text">Intelligence</span></h2>
            <p className="text-primary-500 max-w-2xl mx-auto">Our AI engine makes home services smarter, fairer, and more predictable.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-7 border border-gray-100"
              >
                <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-primary-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">How It Works</h2>
            <p className="text-primary-500">Four simple steps to a smarter home service experience.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="font-semibold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-primary-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">What Our Customers Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-primary-600 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{t.name}</p>
                    <p className="text-xs text-primary-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-800 to-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready for Smarter Home Services?</h2>
            <p className="text-primary-300 mb-8 text-lg">Join thousands of homeowners who trust Byte Force for intelligent, fair, and reliable home maintenance.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="px-8 py-3.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-700 transition-all shadow-lg">
                Get Started Free
              </Link>
              <Link to="/services" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
