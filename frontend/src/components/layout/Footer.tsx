import { Shield, Heart, Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-white to-slate-50 dark:from-dark-card dark:to-dark-bg border-t border-slate-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary-500" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-md" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                CodeArmour AI
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('footer_tagline')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>{t('footer_codebert')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Lock className="w-4 h-4 text-green-500" />
              <span>{t('footer_secure')}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
              <span>{t('footer_made_with')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              {language === 'en' && <span>{t('footer_in_india')}</span>}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-600">
              © {new Date().getFullYear()} CodeArmour. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
