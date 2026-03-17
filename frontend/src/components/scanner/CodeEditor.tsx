import Editor from '@monaco-editor/react';
import { useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setCode, setLanguage } from '../../store/slices/scannerSlice';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../types';
import { detectLanguage } from '../../utils/languageDetector';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  localizeDescription,
  localizeSeverityLabel,
  localizeVulnerabilityType,
} from '../../utils/localization';

// Monaco language mapping
const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  php: 'php',
  go: 'go',
  ruby: 'ruby',
  rust: 'rust',
};

export default function CodeEditor() {
  const dispatch = useAppDispatch();
  const { language: uiLanguage, t } = useLanguage();
  const { code, language, currentResult } = useAppSelector(
    (state) => state.scanner
  );
  
  // Track if user manually changed language
  const [isManualLanguage, setIsManualLanguage] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      dispatch(setCode(value));
      
      // Auto-detect language with debounce (only if not manually set)
      if (!isManualLanguage && value.trim().length > 20) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          const detection = detectLanguage(value);
          if (detection.confidence > 0.3 && detection.language !== language) {
            dispatch(setLanguage(detection.language));
          }
        }, 500);
      }
    }
  }, [dispatch, isManualLanguage, language]);
  
  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setIsManualLanguage(true);
    dispatch(setLanguage(newLanguage));
  };

  // Get decorations for highlighting vulnerabilities
  const getDecorations = () => {
    if (!currentResult?.vulnerabilities) return [];

    return currentResult.vulnerabilities.map((vuln) => ({
      range: {
        startLineNumber: vuln.location.start_line,
        startColumn: 1,
        endLineNumber: vuln.location.end_line,
        endColumn: 1000,
      },
      options: {
        isWholeLine: true,
        className: `vuln-${vuln.severity}`,
        glyphMarginClassName: `vuln-glyph-${vuln.severity}`,
        hoverMessage: {
              value: `**${localizeVulnerabilityType(vuln.type, uiLanguage)}** (${localizeSeverityLabel(vuln.severity.toUpperCase(), uiLanguage)})\n\n${localizeDescription(vuln.description, uiLanguage)}\n\n*Confidence: ${(vuln.confidence * 100).toFixed(1)}%*`,
        },
      },
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-dark-card border-b border-slate-200 dark:border-dark-border rounded-t-lg">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-400">{uiLanguage === 'hi' ? 'भाषा:' : 'Language:'}</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 dark:text-slate-300"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {t('line_count', { count: code.split('\n').length })}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language]}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            renderLineHighlight: 'all',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
          onMount={(editor, _monaco) => {
            // Apply decorations for vulnerabilities
            if (currentResult?.vulnerabilities) {
              const decorations = getDecorations();
              editor.createDecorationsCollection(decorations as any);
            }
          }}
        />
      </div>
    </div>
  );
}
