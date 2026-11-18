import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shirt, Package, Shield, Truck, LogIn, LogOut, Sparkles, User, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentUser: any;
  onLogout: () => void;
  onQuickLogin: (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onQuickLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Customer Portal', icon: Package },
    { to: '/order/new', label: 'New Order', icon: Sparkles },
    { to: '/staff', label: 'Staff Portal', icon: Truck },
    { to: '/admin', label: 'Admin Analytics', icon: Shield },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/80 shadow-xs">
      {/* Quick Demo Switcher Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FastAPI Backend Live (:8000)
          </span>
          <span className="hidden sm:inline text-slate-400">| Quick Role Demo:</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onQuickLogin('CUSTOMER')}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
              currentUser?.role === 'CUSTOMER'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👤 Customer Demo
          </button>
          <button
            onClick={() => onQuickLogin('STAFF')}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
              currentUser?.role === 'STAFF'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🚚 Staff Demo
          </button>
          <button
            onClick={() => onQuickLogin('ADMIN')}
            className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
              currentUser?.role === 'ADMIN'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👑 Admin Demo
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                LaundryFlow
              </span>
              <span className="block text-[10px] text-gray-500 -mt-1 font-medium">AWS Cloud System</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-xs font-medium text-sky-600 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-gray-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-sky-600/20 transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
