import { AppLanguage } from '../contexts/LanguageContext';

const vulnerabilityTypeHindiMap: Record<string, string> = {
  'SQL Injection': 'SQL इंजेक्शन',
  'Cross-Site Scripting (XSS)': 'क्रॉस-साइट स्क्रिप्टिंग (XSS)',
  'Buffer Overflow': 'बफर ओवरफ्लो',
  'Command Injection': 'कमांड इंजेक्शन',
  'Path Traversal': 'पाथ ट्रैवर्सल',
  'Insecure Deserialization': 'असुरक्षित डी-सीरियलाइजेशन',
  'Hardcoded Credentials': 'हार्डकोडेड क्रेडेंशियल्स',
  'Insecure Random Number Generator': 'असुरक्षित रैंडम नंबर जनरेटर',
  'XML External Entity (XXE)': 'XML एक्सटर्नल एंटिटी (XXE)',
  'Server-Side Request Forgery (SSRF)': 'सर्वर-साइड रिक्वेस्ट फोर्जरी (SSRF)',
  'LDAP Injection': 'LDAP इंजेक्शन',
  'XPath Injection': 'XPath इंजेक्शन',
  Other: 'अन्य',
};

const recommendationHindiMap: Record<string, string> = {
  'Use parameterized queries or prepared statements.':
    'पैरामीटराइज्ड क्वेरी या प्रिपेयर्ड स्टेटमेंट का उपयोग करें।',
  'Sanitize and escape all user input before rendering.':
    'रेंडर करने से पहले सभी यूजर इनपुट को सैनिटाइज और एस्केप करें।',
  'Use bounds-checking functions and safe string handling.':
    'बाउंड्स-चेकिंग फंक्शन और सुरक्षित स्ट्रिंग हैंडलिंग का उपयोग करें।',
  'Avoid executing shell commands with user input.':
    'यूजर इनपुट के साथ शेल कमांड चलाने से बचें।',
  'Validate and sanitize file paths.': 'फाइल पाथ को वैलिडेट और सैनिटाइज करें।',
  'Avoid deserializing untrusted data.': 'अविश्वसनीय डेटा को डी-सीरियलाइज करने से बचें।',
  'Store credentials in environment variables.': 'क्रेडेंशियल्स को environment variables में स्टोर करें।',
  'Use cryptographically secure random generators.':
    'क्रिप्टोग्राफिकली सुरक्षित रैंडम जनरेटर का उपयोग करें।',
  'Disable external entity processing in XML parsers.':
    'XML पार्सर्स में external entity processing बंद करें।',
  'Validate and whitelist allowed URLs.': 'अनुमत URLs को वैलिडेट करें और whitelist करें।',
  'Review and fix the identified security issue.':
    'पहचानी गई सुरक्षा समस्या की समीक्षा करें और उसे ठीक करें।',
};

const severityHindiMap: Record<string, string> = {
  CRITICAL: 'गंभीर',
  HIGH: 'उच्च',
  MEDIUM: 'मध्यम',
  LOW: 'निम्न',
  INFO: 'जानकारी',
};

export function localizeSeverityLabel(severity: string, language: AppLanguage): string {
  if (language === 'en') {
    return severity;
  }
  return severityHindiMap[severity] || severity;
}

export function localizeVulnerabilityType(type: string, language: AppLanguage): string {
  if (language === 'en') {
    return type;
  }
  return vulnerabilityTypeHindiMap[type] || type;
}

export function localizeRecommendation(recommendation: string, language: AppLanguage): string {
  if (language === 'en') {
    return recommendation;
  }
  return recommendationHindiMap[recommendation] || recommendation;
}

export function localizeDescription(description: string, language: AppLanguage): string {
  if (language === 'en') {
    return description;
  }

  const pattern = /^Potential (.+) vulnerability detected with ([0-9.]+%) confidence\.$/;
  const match = description.match(pattern);
  if (match) {
    const type = localizeVulnerabilityType(match[1], language);
    const confidence = match[2];
    return `${type} की संभावित कमजोरी ${confidence} confidence के साथ पाई गई।`;
  }

  return description;
}
