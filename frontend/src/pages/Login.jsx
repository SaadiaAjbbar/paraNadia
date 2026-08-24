import { useState } from 'react';
import api from '../api/axios';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-800 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-4 shadow-lg shadow-blue-500/30">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Parapharmacie Admin</h1>
                    <p className="text-slate-400 text-sm mt-1">Connectez-vous à votre espace de gestion</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-2xl flex items-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                placeholder="admin@parapharmacie.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? (
                            'Connexion en cours...'
                        ) : (
                            <>
                                <span>Se connecter</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}