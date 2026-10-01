import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../../shared/services/apiClient';


const SuperAdminAuth: React.FC = () => {
  const { signIn, signInAs } = useAuth();
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState('superadmin@graphura.com');
  const [password, setPassword] = useState('Super@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password States
  const [authMode, setAuthMode] = useState<'login' | 'forgot-password' | 'verify-otp' | 'reset-password'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('otpExpiresAt');
    if (saved) {
      const remaining = Math.max(0, Math.floor((new Date(saved).getTime() - Date.now()) / 1000));
      if (remaining > 0) {
        setOtpExpiresAt(saved);
        setCountdown(remaining);
      } else {
        localStorage.removeItem('otpExpiresAt');
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email: forgotEmail.trim().toLowerCase() });
      setSuccessMessage('OTP sent successfully to your email');
      if (response.data.data.otpExpiresAt) {
        const expiresAt = response.data.data.otpExpiresAt;
        setOtpExpiresAt(expiresAt);
        localStorage.setItem('otpExpiresAt', expiresAt);
        setCountdown(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email: forgotEmail.trim().toLowerCase() });
      setSuccessMessage('OTP sent successfully to your email');
      if (response.data.data.otpExpiresAt) {
        const expiresAt = response.data.data.otpExpiresAt;
        setOtpExpiresAt(expiresAt);
        localStorage.setItem('otpExpiresAt', expiresAt);
        setCountdown(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
      }
      setAuthMode('verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.post('/auth/verify-reset-otp', {
        email: forgotEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
      });
      const token = response.data.data.resetToken;
      setResetToken(token);
      setSuccessMessage('OTP verified successfully! Please enter your new password.');
      setAuthMode('reset-password');
      setCountdown(0);
      setOtpExpiresAt(null);
      localStorage.removeItem('otpExpiresAt');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiClient.post('/auth/reset-password', {
        resetToken,
        newPassword,
      });
      setSuccessMessage('Password reset successfully! You can now log in.');
      setAuthMode('login');
      setAdminId(forgotEmail);
      setPassword('');
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const isEmail = adminId.includes('@');
      const payload = isEmail
        ? { email: adminId.trim(), password }
        : { mobile: adminId.trim(), password };

      const user = await signIn(payload);

      if (user.role !== 'super-admin') {
        setError('Unauthorized: Only platform administrators are permitted to access this area.');
        return;
      }

      navigate('/superadmin', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify credentials or use demo bypass.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    signInAs('super-admin');
    navigate('/superadmin', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white dark:bg-card border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 shadow-premium relative w-full"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-orange-500 fill-orange-500/10" />
        </div>
        {authMode === 'login' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 font-display">Super Admin Login</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 text-center">
              Login to access the admin dashboard
            </p>
          </>
        )}
        {authMode === 'forgot-password' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 font-display">Forgot Password? 🔒</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 text-center">
              Enter your email to receive an OTP code
            </p>
          </>
        )}
        {authMode === 'verify-otp' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 font-display">Verify OTP ✉️</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 text-center">
              Enter the 6-digit verification code sent to your email
            </p>
          </>
        )}
        {authMode === 'reset-password' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 font-display">Reset Password 🔑</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1 text-center">
              Choose a new strong password for your account
            </p>
          </>
        )}
      </div>

      {authMode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Admin ID field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Admin ID
            </label>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <User className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type="text"
                placeholder="Enter your admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setForgotEmail(adminId.includes('@') ? adminId : '');
                  setAuthMode('forgot-password');
                }}
                className="text-xs text-orange-600 dark:text-orange-500 hover:text-orange-700 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <Lock className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              {successMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleDemoBypass}
              className="w-full py-2.5 text-xs text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/15 border border-dashed border-orange-300 dark:border-orange-900/40 font-semibold rounded-xl transition-all"
            >
              ⚡ Quick Demo Bypass (Login instantly without API)
            </button>
          </div>
        </form>
      )}

      {authMode === 'forgot-password' && (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <Mail className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>{loading ? 'Sending OTP...' : 'Send OTP Code'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setAuthMode('login');
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 font-semibold rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Login</span>
            </button>
          </div>
        </form>
      )}

      {authMode === 'verify-otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Verification Code (OTP)
            </label>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <KeyRound className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm tracking-widest text-center font-mono font-bold"
                maxLength={6}
                required
              />
            </div>
            {countdown > 0 ? (
              <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mt-2">
                OTP expires in: {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
              </p>
            ) : (
              <p className="text-sm font-medium text-red-500 mt-2">
                OTP expired.
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || countdown <= 0}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 text-white font-semibold rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-[0.98] ${
                countdown <= 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <span>{loading ? 'Verifying OTP...' : 'Verify OTP'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {countdown <= 0 && (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span>{loading ? 'Sending...' : 'Resend OTP'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setAuthMode('forgot-password');
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 font-semibold rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
          </div>
        </form>
      )}

      {authMode === 'reset-password' && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              New Password
            </label>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <Lock className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
              <Lock className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:ring-0 text-sm"
                required
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">Please re-enter your password manually.</p>
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex justify-center items-center space-x-2 text-sm">
        <span className="text-slate-400 dark:text-zinc-500">Need help?</span>
        <button
          type="button"
          className="text-orange-600 dark:text-orange-500 hover:text-orange-700 font-semibold hover:underline"
        >
          Contact your administrator
        </button>
      </div>
    </motion.div>
  );
};

export default SuperAdminAuth;