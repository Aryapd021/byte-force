
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
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const examples = [
  'AC is running but not cooling properly',
  'Water leaking from kitchen pipe',
  'Electrical sparking from switch board',
  'Washing machine making loud noise',
  'Geyser not heating water',
  'Refrigerator not maintaining temperature',
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

      // Handle API response
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

    if (l.includes('critical') || l.includes('high'))
      return 'bg-red-100 text-red-700';

    if (l.includes('medium'))
      return 'bg-yellow-100 text-yellow-700';

    return 'bg-green-100 text-green-700';
  };

  // Get confidence from backend
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

  // Category
  const category =
    result?.predicted_category ||
    result?.category ||
    'General';

  // Possible issues
  const issues = Array.isArray(result?.possible_issues)
    ? result.possible_issues
    : result?.possible_issue
      ? [result.possible_issue]
      : [];

  // Recommended services
  const services = Array.isArray(result?.recommended_services)
    ? result.recommended_services
    : result?.recommended_service
      ? [result.recommended_service]
      : [];

  // Troubleshooting advice
  const steps = Array.isArray(result?.troubleshooting_steps)
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
            <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-primary mb-2">
              AI Smart Diagnosis
            </h1>

            <p className="text-primary-500">
              Describe your home problem and let our AI find the right solution
            </p>
          </div>

          {/* Input Card */}
          <div className="card mb-6">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your problem in detail..."
                className="input-field h-32 resize-none pr-12"
                maxLength={500}
              />

              <span className="absolute bottom-3 right-3 text-xs text-primary-400">
                {description.length}/500
              </span>
            </div>

            {/* Example Problems */}
            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              {examples.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setDescription(ex)}
                  className="px-3 py-1.5 bg-gray-100 text-primary-600 text-xs rounded-full hover:bg-secondary-50 hover:text-secondary transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Diagnose Button */}
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={loading || !description.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Diagnose
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
                <div className="card">

                  {/* Result Heading */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      Diagnosis Result
                    </h2>

                    {result.urgency && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor(result.urgency)}`}>
                        {result.urgency} Priority
                      </span>
                    )}
                  </div>

                  {/* Category and Confidence */}
                  <div className="p-4 bg-secondary-50 rounded-xl mb-4">
                    <p className="text-sm text-primary-500">
                      Identified Category
                    </p>

                    <p className="text-xl font-bold text-secondary capitalize">
                      {String(category).replace(/-/g, ' ')}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-500"
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>

                      <span className="text-sm font-medium text-secondary">
                        {confidencePercent}%
                      </span>
                    </div>
                  </div>

                  {/* Possible Issues */}
                  {issues.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Possible Issues
                      </h3>

                      <ul className="space-y-1">
                        {issues.map((issue: string, i: number) => (
                          <li key={i} className="text-sm text-primary-600 flex items-start gap-2">
                            <span className="text-warning mt-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Services */}
                  {services.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Recommended Services
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {services.map((svc: string, i: number) => (
                          <Link
                            key={i}
                            to="/services"
                            className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 flex items-center gap-1"
                          >
                            {svc}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Troubleshooting Advice */}
                  {steps.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-accent" />
                        Troubleshooting Advice
                      </h3>

                      <ul className="space-y-2 list-disc list-inside">
                        {steps.map((step: string, i: number) => (
                          <li key={i} className="text-sm text-primary-600">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gemini Explanation */}
                  {result.gemini_explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        Gemini AI Explanation
                      </h3>

                      <p className="text-sm text-primary-600 whitespace-pre-line leading-7">
                        {result.gemini_explanation}
                      </p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="p-3 bg-amber-50 rounded-xl mt-4">
                    <p className="text-xs text-amber-700">
                      ⚠️ {result.disclaimer ||
                        'This is an AI-generated preliminary diagnosis. A qualified technician may need to inspect the appliance.'}
                    </p>
                  </div>
                </div>
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
