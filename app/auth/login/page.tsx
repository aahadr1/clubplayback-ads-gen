'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { Mail, Lock, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            ClubPlayback
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Transform your ideas into stunning visuals with AI-powered image generation
          </p>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: 'Powered by Google\'s nano-banana' },
              { icon: Zap, text: 'Lightning-fast generation' },
              { icon: ArrowRight, text: 'Professional-quality results' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-lg">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-xl opacity-40" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ClubPlayback
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered image generation
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-strong rounded-3xl p-8 lg:p-10 shadow-2xl border-2 border-gray-200/60 dark:border-dark-700/60">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Sign up to start creating' : 'Sign in to continue creating'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12 py-3.5 text-base"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12 py-3.5 text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                >
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}

