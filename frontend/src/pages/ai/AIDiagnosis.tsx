import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '@/services/api';
import {
  Brain,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Bot,
  Wrench,
  ShieldCheck,
  Check
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const examples = [
  'AC is running but not cooling properly',
  'Geyser not heating water and tripping MCB',
  'Water leaking from kitchen wall pipe',
  'Wooden door jammed and cannot lock',
  'Termites found in wooden wardrobe',
  'Washing machine making loud noise on spin',
  'Wall paint peeling from damp seepage',
  'What is the capital of France? (Out-of-Domain Test)',
];

const supportedDomains = [
  { name: 'Air Conditioners & HVAC', icon: '❄️', example: 'AC cooling slowly' },
  { name: 'Electrical & Sparking', icon: '⚡', example: 'Switchboard sparking' },
  { name: 'Plumbing & Leaks', icon: '🚰', example: 'Kitchen pipe leak' },
  { name: 'Geysers & Water Heaters', icon: '♨️', example: 'Geyser not heating' },
  { name: 'Refrigerators & Freezers', icon: '🧊', example: 'Fridge not cooling' },
  { name: 'Washing Machines', icon: '🌀', example: 'Loud spin noise' },
  { name: 'RO Water Purifiers', icon: '💧', example: 'Water taste bitter' },
  { name: 'Carpentry & Locks', icon: '🪵', example: 'Wooden door jammed' },
  { name: 'Painting & Seepage', icon: '🎨', example: 'Wall damp seepage' },
  { name: 'Pest Control & Termites', icon: '🐜', example: 'Termites in wardrobe' },
  { name: 'Full Home Deep Cleaning', icon: '🧹', example: 'Sofa deep shampoo' },
  { name: 'CCTV & Smart Locks', icon: '📹', example: 'CCTV camera offline' }
];

export default function AIDiagnosis() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDiagnose = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await aiAPI.diagnose(description);

      // Handle API response (direct or nested)
      const data = res.data?.data ?? res.data;

      setResult(data);
      console.log('AI Diagnosis Response:', data);

    } catch {
      setResult({
        error: true,
        message: 'AI service temporarily unavailable. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (u: string) => {
    const l = u?.toLowerCase() || '';

    if (l.includes('critical'))
      return 'bg-red-100 text-red-700 border-red-200';
    if (l.includes('high'))
      return 'bg-orange-100 text-orange-700 border-orange-200';
    if (l.includes('medium'))
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';

    return 'bg-green-100 text-green-700 border-green-200';
  };

  // Check if out of domain
  const isOutOfDomain = Boolean(
    result?.is_out_of_domain ||
    result?.out_of_domain ||
    result?.predicted_category === 'Out of Domain'
  );

  // Confidence calculation
  const rawConfidence =
    result?.confidence_score ??
    result?.confidence ??
    result?.confidenceScore ??
    0;

  const confidenceNumber = Number(rawConfidence);

  const confidencePercent = Number.isFinite(confidenceNumber)
    ? Math.round(
        Math.max(
          0,
          Math.min(
            100,
            confidenceNumber <= 1 && confidenceNumber > 0
              ? confidenceNumber * 100
              : confidenceNumber
          )
        )
      )
    : 0;

  // Category display
  const categoryDisplay =
    result?.category_display ||
    (result?.predicted_category
      ? String(result.predicted_category).replace(/-/g, ' ')
      : result?.category
        ? String(result.category).replace(/-/g, ' ')
        : 'General Home Service');

  // Possible issues (support singular or array)
  const issues: string[] = Array.isArray(result?.possible_issues) && result.possible_issues.length > 0
    ? result.possible_issues
    : result?.possible_issue
      ? [result.possible_issue]
      : [];

  // Recommended services (support singular or array)
  const services: string[] = Array.isArray(result?.recommended_services) && result.recommended_services.length > 0
    ? result.recommended_services
    : result?.recommended_service
      ? [result.recommended_service]
      : [];

  // Troubleshooting steps (support singular or array)
  const steps: string[] = Array.isArray(result?.troubleshooting_steps) && result.troubleshooting_steps.length > 0
    ? result.troubleshooting_steps
    : result?.troubleshooting_advice
      ? [result.troubleshooting_advice]
      : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Brain className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-primary mb-2">
              AI Smart Diagnosis
            </h1>

            <p className="text-primary-500">
              Describe your appliance problem or home service need and let our AI agent find the exact solution
            </p>
          </div>

          {/* Input Card */}
          <div className="card mb-6 shadow-sm border border-gray-100">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your problem in detail (e.g. AC is blowing warm air, geyser tripping breaker, or water leaking from pipe)..."
                className="input-field h-32 resize-none pr-12 text-sm leading-relaxed"
                maxLength={500}
              />

              <span className="absolute bottom-3 right-3 text-xs text-primary-400">
                {description.length}/500
              </span>
            </div>

            {/* Example Problems */}
            <div className="mt-3 mb-4">
              <p className="text-xs font-semibold text-primary-400 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    type="button"
                    key={ex}
                    onClick={() => setDescription(ex.replace(/\s*\(Out-of-Domain Test\)/, ''))}
                    className="px-3 py-1 bg-gray-100 text-primary-600 text-xs rounded-full hover:bg-secondary-50 hover:text-secondary hover:border-secondary/30 border border-transparent transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnose Button */}
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={loading || !description.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing with AI Agent...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run AI Diagnosis</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {/* Diagnosis Result */}
            {result && !result.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* CASE 1: OUT OF DOMAIN AGENT CARD */}
                {isOutOfDomain ? (
                  <div className="card border border-secondary/20 shadow-md bg-white">
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-white shadow-md">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-primary">HomeGenie AI Assistant</h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-1.5 h-1.5 mr-1 bg-green-500 rounded-full animate-pulse" />
                              Active Agent
                            </span>
                          </div>
                          <p className="text-xs text-primary-400">Specialized Home Services & Repair Diagnosis</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Notice
                      </span>
                    </div>

                    {/* Agent Message Bubble */}
                    <div className="p-4 bg-secondary/5 rounded-2xl mb-5 text-sm text-primary-700 leading-relaxed whitespace-pre-line border border-secondary/10">
                      {result.agent_message || result.gemini_explanation || (
                        "Hello! I am HomeGenie AI, your home maintenance and repair diagnostics agent.\n\nYour query appears to be outside my home services domain. I specialize in diagnosing appliances, electrical, plumbing, carpentry, painting, cleaning, and pest control.\n\nPlease describe an appliance malfunction or home repair issue to get an instant diagnosis!"
                      )}
                    </div>

                    {/* Supported Domains Grid */}
                    <div className="mb-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-secondary" />
                        Services I Can Diagnose For You:
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {supportedDomains.map((dom, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setDescription(dom.example)}
                            className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-left hover:border-secondary hover:bg-secondary/5 transition-all group flex items-start gap-2"
                          >
                            <span className="text-base">{dom.icon}</span>
                            <div>
                              <p className="text-xs font-medium text-primary-700 group-hover:text-secondary leading-snug">
                                {dom.name}
                              </p>
                              <p className="text-[10px] text-primary-400">e.g. "{dom.example}"</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer Call to Action */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-primary-500">Need to book a verified technician directly?</span>
                      <Link
                        to="/services"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                      >
                        Browse All Services <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* CASE 2: IN-DOMAIN FULL DIAGNOSIS RESULT */
                  <div className="card shadow-md border border-gray-100">

                    {/* Result Heading */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        Diagnosis Result
                      </h2>

                      {result.urgency && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${urgencyColor(result.urgency)}`}>
                          {result.urgency} Priority
                        </span>
                      )}
                    </div>

                    {/* Category and Confidence */}
                    <div className="p-4 bg-gradient-to-r from-secondary-50 to-secondary/10 rounded-2xl mb-4 border border-secondary/10">
                      <p className="text-xs font-medium text-primary-400 uppercase tracking-wide">
                        Identified Service Domain
                      </p>

                      <p className="text-xl font-bold text-secondary capitalize mt-0.5">
                        {categoryDisplay}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-500"
                            style={{ width: `${confidencePercent}%` }}
                          />
                        </div>

                        <span className="text-xs font-bold text-secondary">
                          {confidencePercent}% Confidence
                        </span>
                      </div>
                    </div>

                    {/* Possible Issues */}
                    {issues.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Possible Issues Identified
                        </h3>

                        <ul className="space-y-1.5">
                          {issues.map((issue: string, i: number) => (
                            <li key={i} className="text-sm text-primary-600 flex items-start gap-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span className="leading-snug">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Services */}
                    {services.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-primary mb-2.5 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Recommended Verified Services
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {services.map((svc: string, i: number) => (
                            <Link
                              key={i}
                              to="/services"
                              className="px-3 py-2 bg-green-50 text-green-800 text-xs font-medium rounded-xl hover:bg-green-100 border border-green-200 flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <span>{svc}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-green-600" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Troubleshooting Advice */}
                    {steps.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-primary mb-2.5 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-accent" />
                          Troubleshooting & Safety Steps
                        </h3>

                        <ul className="space-y-2">
                          {steps.map((step: string, i: number) => (
                            <li key={i} className="text-xs text-primary-600 flex items-start gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <span className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gemini Explanation */}
                    {result.gemini_explanation && (
                      <div className="mt-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
                        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-secondary" />
                          Gemini AI Detailed Analysis
                        </h3>

                        <p className="text-xs text-primary-600 whitespace-pre-line leading-relaxed">
                          {result.gemini_explanation}
                        </p>
                      </div>
                    )}

                    {/* Book Now Action Banner */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-secondary/20">
                      <div>
                        <p className="text-sm font-bold text-primary">Need an expert to resolve this?</p>
                        <p className="text-xs text-primary-500">Book certified technicians with guaranteed warranty</p>
                      </div>
                      <Link
                        to="/services"
                        className="btn-primary py-2 px-4 text-xs font-semibold whitespace-nowrap shadow-sm"
                      >
                        Book Service Now
                      </Link>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-3 bg-amber-50/70 rounded-xl mt-4 border border-amber-100">
                      <p className="text-[11px] text-amber-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                        <span>
                          {result.disclaimer ||
                            'This is an AI-generated preliminary diagnosis. A certified technician should inspect before repairs.'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Error Message */}
            {result?.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-8"
              >
                <p className="text-primary-500">
                  {result.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
