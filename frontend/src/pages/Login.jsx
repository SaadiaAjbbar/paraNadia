import { useState } from 'react';
import api from '../api/axios';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('admin@parapharmacie.com');
    const [password, setPassword] = useState('admin123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            const { access_token, user } = response.data;

            // حفظ الـ Token والمعلومات فـ LocalStorage
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-800">Parapharmacie Admin</h1>
                    <p className="text-emerald-600 text-sm mt-2">Connectez-vous à votre espace de gestion</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            placeholder="admin@parapharmacie.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}