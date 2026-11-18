import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { OrderWizard } from './pages/OrderWizard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthForms } from './pages/AuthForms';
import { apiClient } from './api/client';

export function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo user so customer view is immediately active
    return {
      name: 'Sarah Jenkins',
      email: 'customer@laundryflow.com',
      role: 'CUSTOMER'
    };
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleQuickLogin = async (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    let email = 'customer@laundryflow.com';
    let password = 'customer123';
    let fallbackName = 'Sarah Jenkins';

    if (role === 'STAFF') {
      email = 'staff@laundryflow.com';
      password = 'staff123';
      fallbackName = 'Alex Turner (Staff)';
    } else if (role === 'ADMIN') {
      email = 'admin@laundryflow.com';
      password = 'admin123';
      fallbackName = 'System Admin';
    }

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
    } catch {
      // Offline fallback state
      const fallbackUser = {
        name: fallbackName,
        email,
        role
      };
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setCurrentUser(fallbackUser);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onQuickLogin={handleQuickLogin}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<CustomerDashboard currentUser={currentUser} />} />
            <Route path="/order/new" element={<OrderWizard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/login"
              element={
                <AuthForms
                  isLogin={true}
                  onLoginSuccess={(user) => setCurrentUser(user)}
                />
              }
            />
            <Route
              path="/register"
              element={
                <AuthForms
                  isLogin={false}
                  onLoginSuccess={(user) => setCurrentUser(user)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
