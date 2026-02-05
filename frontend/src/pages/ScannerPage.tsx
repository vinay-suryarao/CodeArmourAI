import { Play, Upload, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { scanCode, clearResult, setCode, setLanguage } from '../store/slices/scannerSlice';
import CodeEditor from '../components/scanner/CodeEditor';
import ResultsPanel from '../components/scanner/ResultsPanel';
import toast from 'react-hot-toast';
import { validateLanguageMatch } from '../utils/languageDetector';

export default function ScannerPage() {
  const dispatch = useAppDispatch();
  const { code, language, filename, isScanning, currentResult } = useAppSelector(
    (state) => state.scanner
  );

  const handleScan = () => {
    if (!code.trim()) {
      toast.error('Please enter some code to scan');
      return;
    }

    // Validate language match before scanning
    const validation = validateLanguageMatch(code, language);
    if (!validation.isValid) {
      toast.error(validation.message || 'Language mismatch detected', {
        duration: 5000,
        icon: '⚠️',
      });
      // Show suggestion to switch language
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span>Switch to {validation.detectedLanguage}?</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-primary-500 text-white rounded text-sm"
              onClick={() => {
                dispatch(setLanguage(validation.detectedLanguage));
                toast.dismiss(t.id);
                toast.success(`Switched to ${validation.detectedLanguage}`);
              }}
            >
              Yes, switch
            </button>
            <button
              className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Keep current
            </button>
          </div>
        </div>
      ), { duration: 10000 });
      return;
    }

    dispatch(scanCode({ code, language, filename }));
  };

  const handleClear = () => {
    dispatch(clearResult());
    dispatch(setCode(''));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      dispatch(setCode(content));
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Security Scanner
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Paste your code or upload a file to scan for vulnerabilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* File Upload */}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              accept=".py,.js,.ts,.java,.c,.cpp,.cs,.php,.go,.rb,.rs"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={!code && !currentResult}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning || !code.trim()}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Scan Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Code Editor */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
          <CodeEditor />
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
}
