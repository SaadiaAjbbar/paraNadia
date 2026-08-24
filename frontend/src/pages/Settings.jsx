import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Store, Phone, MapPin, Mail, Save, CheckCircle } from 'lucide-react';

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
        return <div className="p-8 text-center text-gray-500">Chargement des paramètres...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Paramètres de la Parapharmacie</h1>
                <p className="text-gray-500 text-sm">Gérez les informations qui apparaîtront sur vos factures et reçus</p>
            </div>

            {successMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nom de la Parapharmacie</label>
                    <div className="relative">
                        <Store className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                            placeholder="Ex: Parapharmacie Sante & Beaute"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Numéro de Téléphone</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                placeholder="Ex: 0522 00 00 00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email (Optionnel)</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                placeholder="contact@para.ma"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse Complète</label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <textarea
                            rows="2"
                            required
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                            placeholder="Adresse de la parapharmacie..."
                        ></textarea>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ICE (Optionnel)</label>
                    <input
                        type="text"
                        value={form.ice}
                        onChange={(e) => setForm({ ...form, ice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                        placeholder="Ex: 001234567000089"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}