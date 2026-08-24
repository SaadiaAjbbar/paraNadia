import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Store, Phone, MapPin, Mail, Save, CheckCircle, FileText } from 'lucide-react';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
        ice: ''
    });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/parapharmacy-settings');
            if (res.data) {
                setForm({
                    name: res.data.name || '',
                    phone: res.data.phone || '',
                    address: res.data.address || '',
                    email: res.data.email || '',
                    ice: res.data.ice || ''
                });
            }
        } catch (err) {
            console.error('Erreur de chargement des paramètres:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put('/parapharmacy-settings', form);
            setSuccessMessage('Informations enregistrées avec succès !');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            alert('Erreur lors de la sauvegarde des informations');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500 animate-pulse">Chargement des paramètres...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Paramètres de la Parapharmacie</h1>
                <p className="text-slate-400 text-sm mt-1">Gérez les informations qui apparaîtront sur vos factures et reçus</p>
            </div>

            {/* Success Alert */}
            {successMessage && (
                <div className="p-4 bg-emerald-950/40 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center gap-3 text-sm font-semibold shadow-lg shadow-emerald-950/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    {successMessage}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl shadow-black/20 space-y-5">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nom de la Parapharmacie</label>
                    <div className="relative">
                        <Store className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ex: Parapharmacie Santé & Beauté"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Numéro de Téléphone</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                placeholder="Ex: 0522 00 00 00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email (Optionnel)</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                placeholder="contact@para.ma"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Adresse Complète</label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <textarea
                            rows="2"
                            required
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="Adresse de la parapharmacie..."
                        ></textarea>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">ICE (Optionnel)</label>
                    <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                            type="text"
                            value={form.ice}
                            onChange={(e) => setForm({ ...form, ice: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ex: 001234567000089"
                        />
                    </div>
                </div>

                <div className="pt-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}