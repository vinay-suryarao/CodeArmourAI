import { Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              CodeArmour AI - AI-powered Security Scanner
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>using CodeBERT & FastAPI</span>
          </div>
          
          <div className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} CodeArmour. Open Source.
          </div>
        </div>
      </div>
    </footer>
  );
}
