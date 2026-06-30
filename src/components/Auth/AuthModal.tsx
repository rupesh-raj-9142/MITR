import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { X, Sparkles, User, Mail, Lock, ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isGuestScreen, setIsGuestScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase cloud parameters are not configured. Please use local guest mode.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || 'Companion',
            },
          },
        });

        if (error) throw error;
        
        if (data.user && data.session === null) {
          setSuccessMsg('Account created successfully! Please check your email inbox to verify your account.');
        } else if (data.user && data.session) {
          setSuccessMsg('Signed up successfully!');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg('Welcome back to Aira AI!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginGuest(guestName.trim() || 'Companion');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10 p-7 text-sm"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-primary-text/60 hover:text-primary-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/25 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-primary-text">
            {isGuestScreen ? 'Enter Virtual Lounge' : isSignUp ? 'Create your Profile' : 'Access Aira AI'}
          </h2>
          <p className="text-xs text-primary-text/50 mt-1">
            {isGuestScreen 
              ? 'Start communicating instantly with your offline companion.' 
              : isSignUp ? 'Sign up to remember conversations and settings' : 'Sign in to access your cloud-saved conversations'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            {successMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isGuestScreen ? (
            /* 1. Guest Login Screen */
            <motion.form
              key="guestForm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleGuestLogin}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60">What should Aira call you?</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-primary-text placeholder-indigo-300/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all duration-300"
              >
                <span>Enter Chatroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsGuestScreen(false)}
                className="w-full text-center text-xs text-indigo-400 hover:text-cyan-400 transition-colors pt-2"
              >
                Back to credentials login
              </button>
            </motion.form>
          ) : (
            /* 2. Credentials Sign In / Up Forms */
            <motion.form
              key="credentialsForm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAuth}
              className="space-y-4"
            >
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs text-primary-text/60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                    <input
                      type="text"
                      required={isSignUp}
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-primary-text placeholder-indigo-300/30"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-primary-text placeholder-indigo-300/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-primary-text placeholder-indigo-300/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setIsSignUp(prev => !prev)}
                  className="text-indigo-400 hover:text-cyan-400 transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>

                <div className="flex items-center gap-2 my-1 text-primary-text/20">
                  <hr className="flex-1 border-white/10" />
                  <span>or</span>
                  <hr className="flex-1 border-white/10" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsGuestScreen(true)}
                  className="text-primary-text/60 hover:text-primary-text transition-colors font-semibold"
                >
                  Continue local as Guest (No account needed)
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
