import { useState } from 'react';
import api from '../api/axios';
import { User, Mail, Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'vendeuse'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/register', {
                ...formData,
                email: formData.email.trim().toLowerCase()
            });

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-800 relative z-10">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-3 shadow-lg shadow-blue-500/30">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Créer un compte</h1>
                    <p className="text-slate-400 text-sm mt-1">Inscription Parapharmacie</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">Nom complet</label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Nadia Alami"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="nadia@parapharmacie.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">Mot de passe</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">Rôle</label>
                        <div className="relative">
                            <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="vendeuse">Vendeuse</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/25"
                    >
                        {loading ? 'Création...' : (
                            <>
                                <span>S'inscrire</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-xs text-blue-400 hover:underline"
                    >
                        Vous avez déjà un compte ? Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
}