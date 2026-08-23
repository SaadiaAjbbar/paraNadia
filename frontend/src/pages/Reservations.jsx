import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reservations');
            setReservations(res.data.data || res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des réservations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/reservations/${id}/status`, { status });
            fetchReservations();
        } catch (err) {
            alert('Impossible de mettre à jour le statut');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h1>
                <p className="text-gray-500 text-sm">Gérez les rendez-vous et réservations de services</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
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
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {reservations.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{res.client_name || res.user?.name || 'Client'}</p>
                                        <p className="text-xs text-gray-500">{res.phone || 'N/A'}</p>
                                    </td>
                                    <td className="p-4 font-medium text-emerald-700">
                                        {res.service_name || res.service?.name || 'Soin / Consultation'}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {res.date} {res.time && `à ${res.time}`}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {res.status === 'confirmed' ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Confirmée</span>
                                        ) : res.status === 'cancelled' ? (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Annulée</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-medium"><Clock className="w-3.5 h-3.5" /> En attente</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={res.status}
                                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded-lg p-1.5 bg-white outline-none focus:border-emerald-500"
                                        >
                                            <option value="pending">En attente</option>
                                            <option value="confirmed">Confirmer</option>
                                            <option value="cancelled">Annuler</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}