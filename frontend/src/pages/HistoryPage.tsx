import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileCode, AlertTriangle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { ScanResult } from '../types';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeSeverityLabel } from '../utils/localization';

export default function HistoryPage() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUserHistory();
      setScanHistory(data.scans || []);
    } catch (error: any) {
      console.error('Failed to fetch history:', error);
      toast.error(t('toast_history_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all scan history?')) return;
    
    setIsClearing(true);
    try {
      await apiService.clearUserHistory();
      setScanHistory([]);
      toast.success(t('toast_history_cleared'));
    } catch (error) {
      toast.error(t('toast_history_clear_failed'));
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      await apiService.deleteScan(scanId);
      setScanHistory((prev) => prev.filter((s) => s.scan_id !== scanId));
      toast.success(t('toast_scan_deleted'));
    } catch (error) {
      toast.error(t('toast_scan_delete_failed'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history_title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {t('history_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('history_refresh')}
          </button>
          
          {scanHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={isClearing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t('history_clear')}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('history_loading')}</p>
        </div>
      ) : scanHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-card flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">{t('history_empty_title')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            {t('history_empty_desc')}
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
                      <span>{t('line_count', { count: scan.summary.lines_scanned })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {scan.summary.total_vulnerabilities > 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      {t('issue_word', { count: scan.summary.total_vulnerabilities })}
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      {t('history_no_issues')}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDeleteScan(scan.scan_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title={t('history_delete_scan')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {scan.summary.total_vulnerabilities > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                  <div className="flex items-center gap-4 text-sm">
                    {scan.summary.critical_count > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {scan.summary.critical_count} {localizeSeverityLabel('CRITICAL', language)}
                      </span>
                    )}
                    {scan.summary.high_count > 0 && (
                      <span className="text-orange-600 dark:text-orange-400">
                        {scan.summary.high_count} {localizeSeverityLabel('HIGH', language)}
                      </span>
                    )}
                    {scan.summary.medium_count > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        {scan.summary.medium_count} {localizeSeverityLabel('MEDIUM', language)}
                      </span>
                    )}
                    {scan.summary.low_count > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {scan.summary.low_count} {localizeSeverityLabel('LOW', language)}
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
