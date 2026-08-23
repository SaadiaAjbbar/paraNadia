import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingBag, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders');
            setOrders(res.data.data || res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err) {
            alert('Impossible de mettre à jour le statut');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Livrée</span>;
            case 'cancelled':
                return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Annulée</span>;
            default:
                return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-medium"><Clock className="w-3.5 h-3.5" /> En attente</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Commandes</h1>
                <p className="text-gray-500 text-sm">Suivez et gérez les commandes de vos clients</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement des commandes...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Aucune commande trouvée</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Réf / Client</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">#{order.id}</p>
                                        <p className="text-xs text-gray-500">{order.client_name || order.user?.name || 'Client Passager'}</p>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-4 font-semibold text-emerald-600">
                                        {order.total_price || order.total} DH
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            title="Détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded-lg p-1.5 bg-white outline-none focus:border-emerald-500"
                                        >
                                            <option value="pending">En attente</option>
                                            <option value="completed">Livrée</option>
                                            <option value="cancelled">Annulée</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Détails Commande */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-lg font-bold text-gray-800">Détails Commande #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold text-gray-700">Client :</span> {selectedOrder.client_name || selectedOrder.user?.name || 'Passager'}</p>
                            <p><span className="font-semibold text-gray-700">Téléphone :</span> {selectedOrder.phone || 'N/A'}</p>
                            <p><span className="font-semibold text-gray-700">Adresse :</span> {selectedOrder.address || 'N/A'}</p>
                        </div>
                        <div className="border-t pt-3">
                            <h3 className="font-semibold text-sm text-gray-800 mb-2">Produits commandés</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedOrder.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs bg-gray-50 p-2 rounded-lg">
                                        <span>{item.product?.name || `Produit #${item.product_id}`} (x{item.quantity})</span>
                                        <span className="font-medium text-emerald-600">{item.price} DH</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t pt-3 font-bold text-gray-800">
                            <span>Total :</span>
                            <span className="text-emerald-600">{selectedOrder.total_price || selectedOrder.total} DH</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}