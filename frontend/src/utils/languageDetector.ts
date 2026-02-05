import { SupportedLanguage } from '../types';

// Language detection patterns with weights
interface LanguagePattern {
  patterns: RegExp[];
  weight: number;
}

const LANGUAGE_PATTERNS: Record<SupportedLanguage, LanguagePattern> = {
  python: {
    patterns: [
      /^\s*def\s+\w+\s*\(/m,
      /^\s*class\s+\w+.*:/m,
      /^\s*import\s+\w+/m,
      /^\s*from\s+\w+\s+import/m,
      /print\s*\(/,
      /^\s*elif\s+/m,
      /self\./,
      /^\s*#.*$/m,
      /__init__/,
      /^\s*@\w+/m, // decorators
      /:\s*$/m, // Python colon syntax
    ],
    weight: 1,
  },
  javascript: {
    patterns: [
      /\bfunction\s+\w+\s*\(/,
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bvar\s+\w+\s*=/,
      /=>\s*[{\(]/,
      /console\.(log|error|warn)/,
      /document\./,
      /window\./,
      /require\s*\(/,
      /export\s+(default|const|function)/,
      /import\s+.*\s+from\s+['"]/,
      /\.then\s*\(/,
      /async\s+function/,
      /\bawait\s+/,
    ],
    weight: 1,
  },
  java: {
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.print/,
      /import\s+java\./,
      /private\s+(final\s+)?\w+\s+\w+;/,
      /public\s+\w+\s+\w+\s*\(/,
      /@Override/,
      /new\s+\w+\s*\(/,
      /\.class\b/,
      /throws\s+\w+/,
    ],
    weight: 1,
  },
  cpp: {
    patterns: [
      /#include\s*<.*>/,
      /using\s+namespace\s+std/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /int\s+main\s*\(\s*(void|int\s+argc)?\s*[,)]/,
      /nullptr/,
      /template\s*</,
      /::\w+/,
    ],
    weight: 1,
  },
  c: {
    patterns: [
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /printf\s*\(/,
      /scanf\s*\(/,
      /int\s+main\s*\(\s*(void)?\s*\)/,
      /malloc\s*\(/,
      /free\s*\(/,
      /NULL\b/,
    ],
    weight: 1,
  },
  csharp: {
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /Console\.(WriteLine|Write|ReadLine)/,
      /\bstring\[\]\s+args\b/,
      /\bvar\s+\w+\s*=/,
      /\basync\s+Task/,
      /\bawait\s+/,
    ],
    weight: 1,
  },
  php: {
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /echo\s+/,
      /function\s+\w+\s*\(/,
      /->/,
      /\$this->/,
      /\barray\s*\(/,
      /\bforeach\s*\(/,
    ],
    weight: 1,
  },
  go: {
    patterns: [
      /^package\s+\w+/m,
      /func\s+\w+\s*\(/,
      /func\s+main\s*\(\)/,
      /import\s+\(/,
      /fmt\.(Print|Println|Printf)/,
      /:=\s*/,
      /\bdefer\s+/,
      /\bgo\s+\w+/,
    ],
    weight: 1,
  },
  ruby: {
    patterns: [
      /^\s*def\s+\w+/m,
      /^\s*end\s*$/m,
      /puts\s+/,
      /\bdo\s*\|/,
      /\.each\s*\{/,
      /attr_(reader|writer|accessor)/,
      /\brequire\s+['"]/,
      /\bclass\s+\w+\s*$/m,
    ],
    weight: 1,
  },
  rust: {
    patterns: [
      /fn\s+main\s*\(\)/,
      /fn\s+\w+\s*\(/,
      /let\s+mut\s+/,
      /let\s+\w+\s*:/,
      /println!\s*\(/,
      /use\s+std::/,
      /impl\s+\w+/,
      /pub\s+fn/,
      /::new\s*\(/,
      /&mut\s+/,
    ],
    weight: 1,
  },
};

export interface DetectionResult {
  language: SupportedLanguage;
  confidence: number;
  scores: Record<SupportedLanguage, number>;
}

/**
 * Detects the programming language from code content
 * @param code - The source code to analyze
 * @returns Detection result with language, confidence and scores
 */
export function detectLanguage(code: string): DetectionResult {
  if (!code || code.trim().length === 0) {
    return {
      language: 'python',
      confidence: 0,
      scores: {} as Record<SupportedLanguage, number>,
    };
  }

  const scores: Record<SupportedLanguage, number> = {} as Record<SupportedLanguage, number>;
  let maxScore = 0;
  let detectedLanguage: SupportedLanguage = 'python';

  for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;
    for (const pattern of config.patterns) {
      const matches = code.match(pattern);
      if (matches) {
        score += config.weight;
      }
    }
    scores[lang as SupportedLanguage] = score;

    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = lang as SupportedLanguage;
    }
  }

  // Calculate confidence based on score difference
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = maxScore > 0 
    ? Math.min(1, (sortedScores[0] - (sortedScores[1] || 0) + sortedScores[0]) / (LANGUAGE_PATTERNS[detectedLanguage].patterns.length))
    : 0;

  return {
    language: detectedLanguage,
    confidence: Math.round(confidence * 100) / 100,
    scores,
  };
}

/**
 * Validates if the selected language matches the detected language
 * @param code - The source code
 * @param selectedLanguage - The language selected by user
 * @returns Validation result with error message if mismatch
 */
export function validateLanguageMatch(
  code: string,
  selectedLanguage: SupportedLanguage
): { isValid: boolean; detectedLanguage: SupportedLanguage; message?: string } {
  const detection = detectLanguage(code);
  
  // If confidence is very low, don't flag as mismatch
  if (detection.confidence < 0.3) {
    return { isValid: true, detectedLanguage: detection.language };
  }

  // Check if selected matches detected
  if (selectedLanguage === detection.language) {
    return { isValid: true, detectedLanguage: detection.language };
  }

  // Allow similar languages (e.g., C and C++)
  const similarLanguages: Record<SupportedLanguage, SupportedLanguage[]> = {
    c: ['cpp'],
    cpp: ['c'],
    javascript: [],
    python: [],
    java: [],
    csharp: [],
    php: [],
    go: [],
    ruby: [],
    rust: [],
  };

  if (similarLanguages[selectedLanguage]?.includes(detection.language)) {
    return { isValid: true, detectedLanguage: detection.language };
  }

  return {
    isValid: false,
    detectedLanguage: detection.language,
    message: `Code appears to be ${getLanguageLabel(detection.language)}, but ${getLanguageLabel(selectedLanguage)} is selected. Please select the correct language.`,
  };
}

function getLanguageLabel(lang: SupportedLanguage): string {
  const labels: Record<SupportedLanguage, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    php: 'PHP',
    go: 'Go',
    ruby: 'Ruby',
    rust: 'Rust',
  };
  return labels[lang];
}
