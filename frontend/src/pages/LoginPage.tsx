import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(t('toast_login_welcome'));
      navigate('/scanner');
    } catch (error: any) {
      let message = t('toast_login_failed');
      if (error.code === 'auth/user-not-found') {
        message = t('toast_no_account_email');
      } else if (error.code === 'auth/wrong-password') {
        message = t('toast_incorrect_password');
      } else if (error.code === 'auth/invalid-email') {
        message = t('toast_invalid_email');
      } else if (error.code === 'auth/too-many-requests') {
        message = t('toast_too_many_attempts');
      } else if (error.code === 'auth/invalid-credential') {
        message = t('toast_invalid_credentials');
      } else if (error.code === 'auth/invalid-api-key') {
        message = 'Firebase API key invalid hai. frontend/.env me real Firebase config set karo';
      } else if (typeof error?.message === 'string' && error.message.includes('Firebase is not configured')) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-10 h-10 text-primary-500 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg" />
            </div>
            <span className="font-bold text-2xl text-slate-900 dark:text-white">
              CodeArmour
              <span className="text-primary-500 ml-1">AI</span>
            </span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
            {t('login_subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('login_email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('login_password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('login_forgot')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder={t('login_enter_password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('login_signing')}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('login_signin')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          {t('login_no_account')}{' '}
          <Link
            to="/register"
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            {t('login_create_one')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
