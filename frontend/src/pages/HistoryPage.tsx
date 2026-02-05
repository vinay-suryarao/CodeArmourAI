import { motion } from 'framer-motion';
import { Clock, FileCode, AlertTriangle, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { clearHistory } from '../store/slices/scannerSlice';

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { scanHistory } = useAppSelector((state) => state.scanner);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all scan history?')) {
      dispatch(clearHistory());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scan History</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            View your recent code scans (stored in browser)
          </p>
        </div>

        {scanHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {scanHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-card flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No scan history</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Your scan results will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scanHistory.map((scan, index) => (
            <motion.div
              key={scan.scan_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-bg flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {scan.filename || 'Untitled'}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-500">
                      <span>{scan.language}</span>
                      <span>•</span>
                      <span>{new Date(scan.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{scan.summary.lines_scanned} lines</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {scan.summary.total_vulnerabilities > 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      {scan.summary.total_vulnerabilities} {scan.summary.total_vulnerabilities === 1 ? 'issue' : 'issues'}
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      No issues
                    </div>
                  )}
                </div>
              </div>

              {scan.summary.total_vulnerabilities > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                  <div className="flex items-center gap-4 text-sm">
                    {scan.summary.critical_count > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {scan.summary.critical_count} Critical
                      </span>
                    )}
                    {scan.summary.high_count > 0 && (
                      <span className="text-orange-600 dark:text-orange-400">
                        {scan.summary.high_count} High
                      </span>
                    )}
                    {scan.summary.medium_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        {scan.summary.medium_count} Medium
                      </span>
                    )}
                    {scan.summary.low_count > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {scan.summary.low_count} Low
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
