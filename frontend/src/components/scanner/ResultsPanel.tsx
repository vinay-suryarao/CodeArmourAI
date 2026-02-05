import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  ChevronDown,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectVulnerability } from '../../store/slices/scannerSlice';
import { Vulnerability } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-800',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-800',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-800',
  },
  low: {
    icon: Info,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-800',
  },
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-800',
  },
};

function VulnerabilityCard({ vulnerability, scanId }: { vulnerability: Vulnerability; scanId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const dispatch = useAppDispatch();
  const config = severityConfig[vulnerability.severity];
  const Icon = config.icon;

  const handleFeedback = async (isFalsePositive: boolean) => {
    try {
      await apiService.submitFeedback({
        scan_id: scanId,
        vulnerability_id: vulnerability.id,
        is_false_positive: isFalsePositive,
      });
      setFeedbackSent(true);
      toast.success(isFalsePositive ? 'Marked as false positive' : 'Confirmed as vulnerability');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          dispatch(selectVulnerability(isExpanded ? null : vulnerability.id));
        }}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">
              {vulnerability.type}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-red-500">Line {vulnerability.location.start_line}</span>
              <span className="text-slate-400">•</span>
              <span>{vulnerability.severity.toUpperCase()}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
            {(vulnerability.confidence * 100).toFixed(0)}%
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-dark-border pt-4">
          {/* Description */}
          <div>
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400">{vulnerability.description}</p>
          </div>

          {/* Code Snippet */}
          <div>
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</h5>
            <pre className="p-3 bg-slate-800 rounded-lg text-sm text-slate-200 overflow-x-auto font-mono">
              {vulnerability.location.snippet}
            </pre>
          </div>

          {/* Recommendation */}
          <div>
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recommendation</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400">{vulnerability.recommendation}</p>
          </div>

          {/* References */}
          <div className="flex flex-wrap gap-2">
            {vulnerability.cwe_id && (
              <a
                href={`https://cwe.mitre.org/data/definitions/${vulnerability.cwe_id.replace('CWE-', '')}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-dark-card rounded text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-dark-border transition-colors"
              >
                {vulnerability.cwe_id}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {vulnerability.owasp_category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-dark-card rounded text-slate-700 dark:text-slate-300">
                {vulnerability.owasp_category}
              </span>
            )}
          </div>

          {/* Feedback */}
          {!feedbackSent ? (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-dark-border">
              <span className="text-sm text-slate-500 dark:text-slate-400">Is this accurate?</span>
              <button
                onClick={() => handleFeedback(false)}
                className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                title="Yes, this is a real vulnerability"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback(true)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                title="No, this is a false positive"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 pt-2">
              <CheckCircle className="w-4 h-4" />
              <span>Thank you for your feedback!</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function ResultsPanel() {
  const { currentResult, isScanning } = useAppSelector((state) => state.scanner);

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Analyzing code for vulnerabilities...</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">This may take a moment</p>
      </div>
    );
  }

  if (!currentResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-card flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No scan results</h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
          Click "Scan Code" to analyze your code
        </p>
      </div>
    );
  }

  const { summary, vulnerabilities } = currentResult;

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      <div className="p-4 bg-slate-100 dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Scan Results</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {summary.scan_duration_ms.toFixed(0)}ms
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{summary.critical_count}</div>
            <div className="text-xs text-red-600/70 dark:text-red-400/70">Critical</div>
          </div>
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{summary.high_count}</div>
            <div className="text-xs text-orange-600/70 dark:text-orange-400/70">High</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.medium_count}</div>
            <div className="text-xs text-amber-600/70 dark:text-amber-400/70">Medium</div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summary.low_count}</div>
            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Low</div>
          </div>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.info_count}</div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Info</div>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {vulnerabilities.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-slate-700 dark:text-slate-300">No vulnerabilities found!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Your code appears to be secure
            </p>
          </div>
        ) : (
          vulnerabilities.map((vuln) => (
            <VulnerabilityCard 
              key={vuln.id} 
              vulnerability={vuln} 
              scanId={currentResult.scan_id}
            />
          ))
        )}
      </div>
    </div>
  );
}
