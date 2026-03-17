import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'hi';

type TranslationValue = string | ((params?: Record<string, string | number>) => string);

type TranslationMap = Record<string, TranslationValue>;

const translations: Record<AppLanguage, TranslationMap> = {
  en: {
    nav_home: 'Home',
    nav_scanner: 'Scanner',
    nav_history: 'History',
    nav_about: 'About',
    lang_english: 'English',
    lang_hindi: 'Hindi',
    history_title: 'Scan History',
    history_subtitle: 'Your scan results are stored securely in the cloud',
    history_refresh: 'Refresh',
    history_clear: 'Clear History',
    history_loading: 'Loading your scan history...',
    history_empty_title: 'No scan history',
    history_empty_desc: 'Your scan results will appear here after you scan code',
    history_no_issues: 'No issues',
    history_delete_scan: 'Delete scan',
    scanner_title: 'Security Scanner',
    scanner_subtitle: 'Paste your code or upload a file to scan for vulnerabilities',
    scanner_upload: 'Upload',
    scanner_clear: 'Clear',
    scanner_scan_code: 'Scan Code',
    scanner_scanning: 'Scanning...',
    scanner_results_title: 'Scan Results',
    scanner_analyzing: 'Analyzing code for vulnerabilities...',
    scanner_analyzing_subtitle: 'This may take a moment',
    scanner_no_results: 'No scan results',
    scanner_no_results_desc: 'Click "Scan Code" to analyze your code',
    scanner_no_vulns: 'No vulnerabilities found!',
    scanner_no_vulns_desc: 'Your code appears to be secure',
    results_description: 'Description',
    results_code: 'Code',
    results_recommendation: 'Recommendation',
    results_line: 'Line',
    results_is_accurate: 'Is this accurate?',
    results_feedback_thanks: 'Thank you for your feedback!',
    yes_switch: 'Yes, switch',
    keep_current: 'Keep current',
    lang_mismatch: 'Language mismatch detected',
    line_count: (params?: Record<string, string | number>) => `${params?.count ?? 0} lines`,
    issue_word: (params?: Record<string, string | number>) =>
      `${params?.count ?? 0} ${(Number(params?.count ?? 0) === 1 ? 'issue' : 'issues')}`,
    toast_history_failed: 'Failed to load scan history',
    toast_history_cleared: 'History cleared',
    toast_history_clear_failed: 'Failed to clear history',
    toast_scan_deleted: 'Scan deleted',
    toast_scan_delete_failed: 'Failed to delete scan',
    toast_enter_code: 'Please enter some code to scan',
    toast_switch_to: (params?: Record<string, string | number>) => `Switch to ${params?.lang ?? ''}?`,
    toast_switched_to: (params?: Record<string, string | number>) => `Switched to ${params?.lang ?? ''}`,
    toast_load_file_failed: 'Failed to read file',
    toast_marked_false_positive: 'Marked as false positive',
    toast_confirmed_vulnerability: 'Confirmed as vulnerability',
    toast_feedback_failed: 'Failed to submit feedback',
    home_badge: 'AI-Powered Security Scanner',
    home_title_prefix: 'Secure Your Code with',
    home_subtitle:
      'Detect security vulnerabilities in your source code using advanced deep learning. Fast, accurate, and continuously improving.',
    home_start_scanning: 'Start Scanning',
    home_learn_more: 'Learn More',
    home_why_title: 'Why CodeArmour AI?',
    home_why_subtitle: 'Built with cutting-edge technology to keep your applications secure',
    home_detect_title: 'Vulnerabilities We Detect',
    home_detect_subtitle:
      'Our AI model is trained to identify the most common and dangerous security issues',
    home_cta_title: 'Ready to Secure Your Code?',
    home_cta_subtitle: 'Start scanning your code for vulnerabilities today. Fast, accurate, and secure.',
    home_try_scanner: 'Try the Scanner',
    feature_ai_title: 'AI-Powered Detection',
    feature_ai_desc:
      'Uses CodeBERT deep learning model to understand code semantics and detect vulnerabilities with high accuracy.',
    feature_realtime_title: 'Real-time Analysis',
    feature_realtime_desc:
      'Get instant feedback on your code security. Analyze snippets or entire files in seconds.',
    feature_learning_title: 'Continuous Learning',
    feature_learning_desc:
      'Your feedback helps improve the model. Our MLOps pipeline continuously refines detection accuracy.',
    feature_multilang_title: 'Multi-Language Support',
    feature_multilang_desc:
      'Supports Python, JavaScript, Java, C/C++, and more. One tool for all your codebases.',
    about_title: 'About CodeArmour AI',
    about_subtitle:
      'An AI-powered Static Application Security Testing (SAST) tool designed to detect security vulnerabilities in source code using deep learning.',
    about_how_title: 'How It Works',
    about_step1_title: 'Input Code',
    about_step1_desc: 'Paste your code or upload a file. We support multiple programming languages.',
    about_step2_title: 'AI Analysis',
    about_step2_desc: 'Our CodeBERT model analyzes code semantics to detect vulnerability patterns.',
    about_step3_title: 'Get Results',
    about_step3_desc: 'Receive detailed vulnerability reports with severity levels and fix recommendations.',
    about_stack_title: 'Technology Stack',
    about_secure_title: 'Secure & Private',
    about_secure_desc:
      'Your code never leaves your control. We prioritize security and privacy in everything we do.',
    about_secure_e2e: 'End-to-End Secure',
    about_secure_ai: 'AI-Powered',
    about_secure_fast: 'Lightning Fast',
    login_subtitle: 'Sign in to your account',
    login_email: 'Email',
    login_password: 'Password',
    login_forgot: 'Forgot password?',
    login_enter_password: 'Enter your password',
    login_signing: 'Signing in...',
    login_signin: 'Sign In',
    login_no_account: "Don't have an account?",
    login_create_one: 'Create one',
    register_subtitle: 'Create your account to get started',
    register_full_name: 'Full Name',
    register_password: 'Password',
    register_confirm_password: 'Confirm Password',
    register_min_chars: 'Min 6 characters',
    register_reenter_password: 'Re-enter password',
    register_creating: 'Creating Account...',
    register_create: 'Create Account',
    register_have_account: 'Already have an account?',
    register_signin: 'Sign in',
    forgot_subtitle: 'Reset your password',
    forgot_sent_title: 'Email Sent!',
    forgot_sent_line1: "We've sent a password reset link to",
    forgot_sent_line2:
      'Check your email and click the link to reset your password. The link will expire in 1 hour.',
    forgot_try_other: 'Try a different email',
    forgot_instruction: "Enter your email address and we'll send you a link to reset your password.",
    forgot_sending: 'Sending...',
    forgot_send_link: 'Send Reset Link',
    forgot_back_login: 'Back to Sign In',
    footer_tagline: 'AI-Powered Security Scanner',
    footer_codebert: 'CodeBERT Powered',
    footer_secure: 'Secure & Private',
    footer_made_with: 'Made with',
    footer_in_india: 'in India',
    toast_login_welcome: 'Welcome back!',
    toast_login_failed: 'Failed to sign in',
    toast_no_account_email: 'No account found with this email',
    toast_incorrect_password: 'Incorrect password',
    toast_invalid_email: 'Invalid email address',
    toast_too_many_attempts: 'Too many attempts. Try again later',
    toast_invalid_credentials: 'Invalid email or password',
    toast_password_mismatch: 'Passwords do not match',
    toast_password_min: 'Password must be at least 6 characters',
    toast_enter_name: 'Please enter your name',
    toast_account_created: 'Account created successfully!',
    toast_create_account_failed: 'Failed to create account',
    toast_email_registered: 'Email is already registered',
    toast_weak_password: 'Password is too weak',
    toast_reset_sent: 'Password reset email sent!',
    toast_reset_failed: 'Failed to send reset email',
  },
  hi: {
    nav_home: 'होम',
    nav_scanner: 'स्कैनर',
    nav_history: 'हिस्ट्री',
    nav_about: 'अबाउट',
    lang_english: 'English',
    lang_hindi: 'हिंदी',
    history_title: 'स्कैन हिस्ट्री',
    history_subtitle: 'आपके स्कैन परिणाम सुरक्षित रूप से क्लाउड में स्टोर हैं',
    history_refresh: 'रीफ्रेश',
    history_clear: 'हिस्ट्री साफ करें',
    history_loading: 'आपकी स्कैन हिस्ट्री लोड हो रही है...',
    history_empty_title: 'कोई स्कैन हिस्ट्री नहीं है',
    history_empty_desc: 'कोड स्कैन करने के बाद परिणाम यहां दिखेंगे',
    history_no_issues: 'कोई समस्या नहीं',
    history_delete_scan: 'स्कैन हटाएं',
    scanner_title: 'सिक्योरिटी स्कैनर',
    scanner_subtitle: 'कोड पेस्ट करें या फाइल अपलोड करके कमजोरियां जांचें',
    scanner_upload: 'अपलोड',
    scanner_clear: 'साफ करें',
    scanner_scan_code: 'कोड स्कैन करें',
    scanner_scanning: 'स्कैन हो रहा है...',
    scanner_results_title: 'स्कैन परिणाम',
    scanner_analyzing: 'कोड में कमजोरियां जांची जा रही हैं...',
    scanner_analyzing_subtitle: 'इसमें कुछ समय लग सकता है',
    scanner_no_results: 'कोई स्कैन परिणाम नहीं',
    scanner_no_results_desc: 'अपने कोड का विश्लेषण करने के लिए "कोड स्कैन करें" पर क्लिक करें',
    scanner_no_vulns: 'कोई कमजोरी नहीं मिली!',
    scanner_no_vulns_desc: 'आपका कोड सुरक्षित दिख रहा है',
    results_description: 'विवरण',
    results_code: 'कोड',
    results_recommendation: 'सुझाव',
    results_line: 'लाइन',
    results_is_accurate: 'क्या यह सही है?',
    results_feedback_thanks: 'आपके फीडबैक के लिए धन्यवाद!',
    yes_switch: 'हां, बदलें',
    keep_current: 'वर्तमान रखें',
    lang_mismatch: 'भाषा मेल नहीं खा रही',
    line_count: (params?: Record<string, string | number>) => `${params?.count ?? 0} लाइनें`,
    issue_word: (params?: Record<string, string | number>) => `${params?.count ?? 0} समस्याएं`,
    toast_history_failed: 'स्कैन हिस्ट्री लोड नहीं हो पाई',
    toast_history_cleared: 'हिस्ट्री साफ कर दी गई',
    toast_history_clear_failed: 'हिस्ट्री साफ नहीं हो पाई',
    toast_scan_deleted: 'स्कैन हटाया गया',
    toast_scan_delete_failed: 'स्कैन हटाने में समस्या हुई',
    toast_enter_code: 'स्कैन करने के लिए कुछ कोड डालें',
    toast_switch_to: (params?: Record<string, string | number>) => `${params?.lang ?? ''} पर स्विच करें?`,
    toast_switched_to: (params?: Record<string, string | number>) => `${params?.lang ?? ''} पर स्विच किया गया`,
    toast_load_file_failed: 'फाइल पढ़ने में समस्या हुई',
    toast_marked_false_positive: 'इसे फॉल्स पॉजिटिव के रूप में मार्क किया गया',
    toast_confirmed_vulnerability: 'इसे वास्तविक कमजोरी के रूप में कन्फर्म किया गया',
    toast_feedback_failed: 'फीडबैक भेजने में समस्या हुई',
    home_badge: 'AI-संचालित सिक्योरिटी स्कैनर',
    home_title_prefix: 'अपने कोड को सुरक्षित बनाएं',
    home_subtitle:
      'एडवांस्ड डीप लर्निंग की मदद से अपने सोर्स कोड में सुरक्षा कमजोरियां पहचानें। तेज, सटीक और लगातार बेहतर होता हुआ।',
    home_start_scanning: 'स्कैनिंग शुरू करें',
    home_learn_more: 'और जानें',
    home_why_title: 'CodeArmour AI क्यों?',
    home_why_subtitle: 'आपके एप्लिकेशन को सुरक्षित रखने के लिए आधुनिक तकनीक से बनाया गया',
    home_detect_title: 'हम किन कमजोरियों को पहचानते हैं',
    home_detect_subtitle:
      'हमारा AI मॉडल सामान्य और खतरनाक सुरक्षा समस्याओं की पहचान के लिए प्रशिक्षित है',
    home_cta_title: 'क्या आप अपना कोड सुरक्षित करना चाहते हैं?',
    home_cta_subtitle: 'आज ही अपने कोड की कमजोरियां स्कैन करें। तेज, सटीक और सुरक्षित।',
    home_try_scanner: 'स्कैनर आज़माएं',
    feature_ai_title: 'AI-संचालित पहचान',
    feature_ai_desc:
      'CodeBERT डीप लर्निंग मॉडल कोड का अर्थ समझकर उच्च सटीकता से कमजोरियां पहचानता है।',
    feature_realtime_title: 'रियल-टाइम विश्लेषण',
    feature_realtime_desc: 'अपने कोड की सुरक्षा पर तुरंत फीडबैक पाएं। कुछ सेकंड में स्निपेट या पूरी फाइल जांचें।',
    feature_learning_title: 'निरंतर सीखना',
    feature_learning_desc:
      'आपका फीडबैक मॉडल को बेहतर बनाता है। हमारी MLOps पाइपलाइन लगातार पहचान सटीकता सुधारती है।',
    feature_multilang_title: 'मल्टी-लैंग्वेज सपोर्ट',
    feature_multilang_desc:
      'Python, JavaScript, Java, C/C++ आदि सपोर्ट करता है। सभी कोडबेस के लिए एक ही टूल।',
    about_title: 'CodeArmour AI के बारे में',
    about_subtitle:
      'यह AI-संचालित Static Application Security Testing (SAST) टूल है जो डीप लर्निंग से सोर्स कोड की सुरक्षा कमजोरियां पहचानता है।',
    about_how_title: 'यह कैसे काम करता है',
    about_step1_title: 'कोड इनपुट',
    about_step1_desc: 'अपना कोड पेस्ट करें या फाइल अपलोड करें। हम कई प्रोग्रामिंग भाषाओं को सपोर्ट करते हैं।',
    about_step2_title: 'AI विश्लेषण',
    about_step2_desc: 'हमारा CodeBERT मॉडल कोड semantics का विश्लेषण करके vulnerability patterns पहचानता है।',
    about_step3_title: 'परिणाम प्राप्त करें',
    about_step3_desc: 'Severity स्तर और fix सुझावों के साथ विस्तृत vulnerability रिपोर्ट पाएं।',
    about_stack_title: 'टेक्नोलॉजी स्टैक',
    about_secure_title: 'सुरक्षित और निजी',
    about_secure_desc: 'आपका कोड आपके नियंत्रण में रहता है। हम सुरक्षा और गोपनीयता को सर्वोच्च प्राथमिकता देते हैं।',
    about_secure_e2e: 'एंड-टू-एंड सुरक्षित',
    about_secure_ai: 'AI-संचालित',
    about_secure_fast: 'बहुत तेज',
    login_subtitle: 'अपने अकाउंट में साइन इन करें',
    login_email: 'ईमेल',
    login_password: 'पासवर्ड',
    login_forgot: 'पासवर्ड भूल गए?',
    login_enter_password: 'अपना पासवर्ड दर्ज करें',
    login_signing: 'साइन इन हो रहा है...',
    login_signin: 'साइन इन',
    login_no_account: 'क्या आपका अकाउंट नहीं है?',
    login_create_one: 'नया बनाएं',
    register_subtitle: 'शुरू करने के लिए अपना अकाउंट बनाएं',
    register_full_name: 'पूरा नाम',
    register_password: 'पासवर्ड',
    register_confirm_password: 'पासवर्ड की पुष्टि करें',
    register_min_chars: 'कम से कम 6 अक्षर',
    register_reenter_password: 'पासवर्ड दोबारा दर्ज करें',
    register_creating: 'अकाउंट बन रहा है...',
    register_create: 'अकाउंट बनाएं',
    register_have_account: 'क्या पहले से अकाउंट है?',
    register_signin: 'साइन इन करें',
    forgot_subtitle: 'अपना पासवर्ड रीसेट करें',
    forgot_sent_title: 'ईमेल भेज दिया गया!',
    forgot_sent_line1: 'हमने पासवर्ड रीसेट लिंक भेज दिया है',
    forgot_sent_line2:
      'अपना ईमेल चेक करें और पासवर्ड रीसेट करने के लिए लिंक पर क्लिक करें। लिंक 1 घंटे में समाप्त हो जाएगा।',
    forgot_try_other: 'कोई दूसरा ईमेल आज़माएं',
    forgot_instruction: 'अपना ईमेल दर्ज करें, हम आपको पासवर्ड रीसेट लिंक भेज देंगे।',
    forgot_sending: 'भेजा जा रहा है...',
    forgot_send_link: 'रीसेट लिंक भेजें',
    forgot_back_login: 'साइन इन पर वापस जाएं',
    footer_tagline: 'AI-संचालित सिक्योरिटी स्कैनर',
    footer_codebert: 'CodeBERT संचालित',
    footer_secure: 'सुरक्षित और निजी',
    footer_made_with: 'भारत में बनाया गया',
    footer_in_india: '',
    toast_login_welcome: 'वापसी पर स्वागत है!',
    toast_login_failed: 'साइन इन नहीं हो पाया',
    toast_no_account_email: 'इस ईमेल से कोई अकाउंट नहीं मिला',
    toast_incorrect_password: 'गलत पासवर्ड',
    toast_invalid_email: 'अमान्य ईमेल पता',
    toast_too_many_attempts: 'बहुत अधिक प्रयास हुए। बाद में फिर कोशिश करें',
    toast_invalid_credentials: 'ईमेल या पासवर्ड गलत है',
    toast_password_mismatch: 'पासवर्ड मेल नहीं खा रहे',
    toast_password_min: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    toast_enter_name: 'कृपया अपना नाम दर्ज करें',
    toast_account_created: 'अकाउंट सफलतापूर्वक बन गया!',
    toast_create_account_failed: 'अकाउंट नहीं बन पाया',
    toast_email_registered: 'यह ईमेल पहले से रजिस्टर्ड है',
    toast_weak_password: 'पासवर्ड कमजोर है',
    toast_reset_sent: 'पासवर्ड रीसेट ईमेल भेज दिया गया!',
    toast_reset_failed: 'रीसेट ईमेल भेजने में समस्या हुई',
  },
};

type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('app_language', nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, params?: Record<string, string | number>) => {
        const entry = translations[language][key] ?? translations.en[key] ?? key;
        if (typeof entry === 'function') {
          return entry(params);
        }
        return entry;
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
