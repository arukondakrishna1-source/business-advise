import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { apiFetch } from '../utils/api';
import { X, Lock, Mail, Phone, User as UserIcon, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    loginUser,
    t
  } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!showAuthModal) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password
          })
        });

        loginUser(data.user, data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'login') {
      try {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        loginUser(data.user, data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'forgot') {
      setTimeout(() => {
        setForgotSubmitted(true);
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-brand-900 text-white p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {authMode === 'login' && 'Welcome Back'}
            {authMode === 'register' && 'Create Your Business Account'}
            {authMode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access location-specific business advice & government funding.
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'forgot' && forgotSubmitted ? (
            <div className="text-center py-4">
              <p className="text-sm font-semibold text-emerald-600 mb-2">Password reset instructions sent!</p>
              <p className="text-xs text-slate-600 mb-4">Please check your email address ({formData.email}) for instructions.</p>
              <button
                onClick={() => { setAuthMode('login'); setForgotSubmitted(false); }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {authMode === 'login' ? 'Email Address or Mobile Number' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 mt-2"
              >
                {loading ? 'Processing...' : (
                  authMode === 'login' ? 'Login to Dashboard' :
                  authMode === 'register' ? 'Register Account' : 'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Toggle login vs register */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  onClick={() => { setAuthMode('register'); setError(''); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Create free account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
