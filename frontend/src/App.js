import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CitizenDashboard from './pages/CitizenDashboard';
import DealerDashboard from './pages/DealerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import './App.css';
import { mockUsers, mockEntitlements, mockDeliveries, mockComplaints } from './data/mockData';

export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = (userData) => {
    const newUser = {
      id: 'user_' + Date.now(),
      ...userData,
      role: 'citizen',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'citizen' ? (
                  <Navigate to="/citizen-dashboard" replace />
                ) : user.role === 'dealer' ? (
                  <Navigate to="/dealer-dashboard" replace />
                ) : user.role === 'admin' ? (
                  <Navigate to="/admin-dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/citizen-dashboard"
            element={user && user.role === 'citizen' ? <CitizenDashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/dealer-dashboard"
            element={user && user.role === 'dealer' ? <DealerDashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin-dashboard"
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" replace />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthContext.Provider>
  );
}

export default App;