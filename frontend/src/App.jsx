import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import Sales from './pages/Sales';
import Settings from './pages/Settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegisterSuccess={() => setIsAuthenticated(true)} 
        onSwitchToLogin={() => setShowRegister(false)} 
      />
    ) : (
      <div>
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button 
            onClick={() => setShowRegister(true)} 
            className="text-xs text-slate-400 hover:text-white underline bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800"
          >
            Pas de compte ? S'inscrire ici
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="sales" element={<Sales />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}