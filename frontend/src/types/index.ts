// API response types
export interface VulnerabilityLocation {
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  snippet: string;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;
  location: VulnerabilityLocation;
  description: string;
  recommendation: string;
  cwe_id?: string;
  owasp_category?: string;
}

export interface ScanSummary {
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  lines_scanned: number;
  scan_duration_ms: number;
}

export interface ScanResult {
  scan_id: string;
  status: string;
  timestamp: string;
  language: string;
  filename?: string;
  summary: ScanSummary;
  vulnerabilities: Vulnerability[];
}

// Request types
export interface CodeAnalysisRequest {
  code: string;
  language: string;
  filename?: string;
}

export interface FeedbackRequest {
  scan_id: string;
  vulnerability_id: string;
  is_false_positive: boolean;
  user_comment?: string;
  correct_label?: string;
}

// Health check types
export interface HealthStatus {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, string>;
}

// Language options
export type SupportedLanguage = 
  | 'python'
  | 'javascript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'php'
  | 'go'
  | 'ruby'
  | 'rust';

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
];
