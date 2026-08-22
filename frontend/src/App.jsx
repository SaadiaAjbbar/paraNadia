import { useState, useEffect } from 'react';
import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue dans l'Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}