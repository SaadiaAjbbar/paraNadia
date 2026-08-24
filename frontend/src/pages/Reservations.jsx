import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Calendar, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // تعريف واحد فقط للـ Form State
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h1>
                    <p className="text-gray-500 text-sm">Prise de rendez-vous pour les soins et consultations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Réservation
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement des réservations...</div>
                ) : reservations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Aucune réservation trouvée</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Client</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Date & Heure</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {reservations.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{item.client_name}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Phone className="w-3 h-3" /> {item.phone}
                                        </p>
                                    </td>
                                    <td className="p-4 font-medium text-gray-700">
                                        {item.service?.name || item.service_name || 'Service'}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{item.reservation_date || item.date}</span>
                                            <Clock className="w-3.5 h-3.5 text-gray-400 ml-2" />
                                            <span>{item.time_slot || item.time}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'confirmed'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : item.status === 'cancelled'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                }`}
                                        >
                                            {item.status === 'confirmed' ? 'Confirmée' : item.status === 'cancelled' ? 'Annulée' : 'En attente'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {item.status !== 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'confirmed')}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                title="Confirmer"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {item.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'cancelled')}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Ajouter une Réservation</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Nom du client</label>
                                <input
                                    type="text"
                                    required
                                    value={form.client_name}
                                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                    className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                                <input
                                    type="text"
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
                                <select
                                    required
                                    value={form.service_id}
                                    onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                                    className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="">Sélectionner un service</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.price} DH)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.reservation_date}
                                        onChange={(e) => setForm({ ...form, reservation_date: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Heure</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.time_slot}
                                        onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full border p-2 rounded-xl text-sm hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 text-white p-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
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