import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Try again later';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
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
            Reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-xl p-8">
          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Email Sent!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                We've sent a password reset link to <br />
                <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                Check your email and click the link to reset your password. 
                The link will expire in 1 hour.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail(''); }}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Try a different email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
