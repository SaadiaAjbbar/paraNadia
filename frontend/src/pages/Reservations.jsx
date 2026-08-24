import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Calendar, Clock, Phone, CheckCircle, XCircle, X, Sparkles } from 'lucide-react';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        client_name: '',
        phone: '',
        service_id: '',
        reservation_date: '',
        time_slot: '10:00'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resData, servData] = await Promise.all([
                api.get('/reservations'),
                api.get('/services')
            ]);
            setReservations(resData.data.data || resData.data || []);
            setServices(servData.data.data || servData.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reservations', {
                client_name: form.client_name,
                phone: form.phone,
                service_id: form.service_id,
                reservation_date: form.reservation_date,
                time_slot: form.time_slot,
                status: 'pending'
            });
            setShowModal(false);
            setForm({
                client_name: '',
                phone: '',
                service_id: '',
                reservation_date: '',
                time_slot: '10:00'
            });
            fetchData();
        } catch (err) {
            alert('Erreur lors de la création de la réservation');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/reservations/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestion des Réservations</h1>
                    <p className="text-slate-400 text-sm mt-1">Prise de rendez-vous pour les soins et consultations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" /> Nouvelle Réservation
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse">Chargement des réservations...</div>
                ) : reservations.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Aucune réservation trouvée</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Date & Heure</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {reservations.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-100">{item.client_name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{item.phone}</span>
                                            </p>
                                        </td>
                                        <td className="p-4 font-medium text-slate-200">
                                            {item.service?.name || item.service_name || 'Service'}
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="flex items-center gap-1 text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                                    {item.reservation_date || item.date}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                    {item.time_slot || item.time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    item.status === 'confirmed'
                                                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                                        : item.status === 'cancelled'
                                                        ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                                                        : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                                                }`}
                                            >
                                                {item.status === 'confirmed' ? 'Confirmée' : item.status === 'cancelled' ? 'Annulée' : 'En attente'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            {item.status !== 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'confirmed')}
                                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition"
                                                    title="Confirmer"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {item.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'cancelled')}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                                                    title="Annuler"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                Ajouter une Réservation
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nom du client</label>
                                <input
                                    type="text"
                                    required
                                    value={form.client_name}
                                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                    placeholder="Ex: Fatima Zahra"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Téléphone</label>
                                <input
                                    type="text"
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="06XXXXXXXX"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Service</label>
                                <select
                                    required
                                    value={form.service_id}
                                    onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="">Sélectionner un service</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.price} DH)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.reservation_date}
                                        onChange={(e) => setForm({ ...form, reservation_date: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Heure</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.time_slot}
                                        onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full border border-slate-800 text-slate-300 hover:bg-slate-800 py-3 rounded-xl text-sm font-semibold transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 transition"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}