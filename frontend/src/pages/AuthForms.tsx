import React, { useState } from 'react';
import { Shirt, Lock, Mail, User, Phone, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface AuthFormsProps {
  isLogin?: boolean;
  onLoginSuccess?: (userData: any, token: string) => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ isLogin = true, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = (email: string, pass: string) => {
    setFormData((prev) => ({ ...prev, email, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await apiClient.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        const { access_token, user } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        if (onLoginSuccess) {
          onLoginSuccess(user, access_token);
        }

        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else if (user.role === 'STAFF') {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else {
        const res = await apiClient.post('/auth/register', {
          name: formData.name || 'New Customer',
          email: formData.email,
          password: formData.password,
          phone: formData.phone || '+1 555-0199'
        });
        // Log in right after registration
        const loginRes = await apiClient.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        const { access_token, user } = loginRes.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        if (onLoginSuccess) {
          onLoginSuccess(user, access_token);
        }
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Shirt className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {isLogin ? 'Sign in to LaundryFlow' : 'Create an Account'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLogin ? 'Access your laundry orders, scheduling & concierge' : 'Join thousands of satisfied premium laundry customers'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 border border-gray-100 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* 1-Click Demo Credentials Quick Fill */}
          {isLogin && (
            <div className="mb-6 p-4 bg-sky-50/70 rounded-2xl border border-sky-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                ⚡ Quick Demo One-Click Login
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('customer@laundryflow.com', 'customer123')}
                  className="py-1.5 px-2 bg-white hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('staff@laundryflow.com', 'staff123')}
                  className="py-1.5 px-2 bg-white hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@laundryflow.com', 'admin123')}
                  className="py-1.5 px-2 bg-white hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors"
                      placeholder="Sarah Jenkins"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors"
                      placeholder="+1 (555) 010-0003"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full justify-center items-center gap-2 rounded-xl bg-sky-600 py-3 px-4 text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
