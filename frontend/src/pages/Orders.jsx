import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingBag, Eye, Trash2, Plus, X } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state pour la création
    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        shipping_address: '',
        payment_type: 'Espèces',
        items: [] // [{ product_id, quantity, price }]
    });

    const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, prodRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products')
            ]);
            setOrders(ordersRes.data.data || ordersRes.data || []);
            setProducts(prodRes.data.data || prodRes.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des données', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // دالة لحساب المجموع الإجمالي لأي طلب
    const getOrderTotal = (order) => {
        const rawTotal = order.total_price ?? order.total ?? order.total_amount ?? order.grand_total;
        if (rawTotal !== undefined && rawTotal !== null && parseFloat(rawTotal) > 0) {
            return parseFloat(rawTotal);
        }
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            return order.items.reduce((sum, item) => {
                const price = parseFloat(item.price ?? item.unit_price ?? 0);
                const qty = parseInt(item.quantity ?? 1);
                return sum + (price * qty);
            }, 0);
        }
        return 0;
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            fetchData();
        } catch (err) {
            // Dans le cas où l'API utilise PUT au lieu de PATCH
            try {
                await api.put(`/orders/${orderId}`, { status: newStatus });
                fetchData();
            } catch (e) {
                alert('Impossible de mettre à jour le statut');
            }
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm('Voulez-vous vraiment supprimer/annuler cette commande ?')) return;
        try {
            await api.delete(`/orders/${orderId}`);
            fetchData();
        } catch (err) {
            try {
                await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
                fetchData();
            } catch (e) {
                alert('Impossible d’annuler la commande');
            }
        }
    };

    // إضافة منتج للـ Form الحالية
    const handleAddItem = () => {
        if (!currentItem.product_id) return;
        const prod = products.find(p => p.id === parseInt(currentItem.product_id));
        if (!prod) return;

        const newItem = {
            product_id: prod.id,
            name: prod.name,
            quantity: parseInt(currentItem.quantity),
            price: parseFloat(prod.price),
            unit_price: parseFloat(prod.price)
        };

        setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setCurrentItem({ product_id: '', quantity: 1 });
    };

    const handleRemoveItem = (index) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // حساب إجمالي الطلب الجديد
    const newOrderTotal = form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (form.items.length === 0) {
            alert('Veuillez ajouter au moins un produit à la commande.');
            return;
        }

        try {
            const payload = {
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                shipping_address: form.shipping_address,
                payment_type: form.payment_type,
                status: 'pending',
                total: newOrderTotal,
                total_price: newOrderTotal,
                total_amount: newOrderTotal,
                items: form.items
            };

            await api.post('/orders', payload);
            setShowCreateModal(false);
            setForm({ customer_name: '', customer_phone: '', shipping_address: '', payment_type: 'Espèces', items: [] });
            fetchData();
        } catch (err) {
            console.error('Validation details:', err.response?.data);
            alert(err.response?.data?.message || 'Erreur lors de la création de la commande');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Commandes</h1>
                    <p className="text-gray-500 text-sm">Suivi, création et modification des commandes clients</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Commande
                </button>
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
                                <th className="p-4">Téléphone / Adresse</th>
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
                                        <p className="text-xs text-gray-500">{order.customer_name || order.client_name || order.user?.name || 'Client Passager'}</p>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        <p>{order.customer_phone || '-'}</p>
                                        <p className="truncate max-w-[150px]">{order.shipping_address || '-'}</p>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                                    </td>
                                    <td className="p-4 font-bold text-emerald-600">
                                        {getOrderTotal(order).toFixed(2)} DH
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.status || 'pending'}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded-lg p-1.5 bg-white outline-none focus:border-emerald-500 font-medium"
                                        >
                                            <option value="pending">En attente</option>
                                            <option value="completed">Livrée / Payée</option>
                                            <option value="cancelled">Annulée</option>
                                        </select>
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            title="Détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Création */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                Nouvelle Commande
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom du Client</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.customer_name}
                                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.customer_phone}
                                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Adresse de Livraison</label>
                                <input
                                    type="text"
                                    required
                                    value={form.shipping_address}
                                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                                    className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Section Ajouter Produit */}
                            <div className="border-t border-b border-gray-100 py-3 space-y-2">
                                <label className="block text-xs font-semibold text-gray-700">Sélectionner les produits</label>
                                <div className="flex gap-2">
                                    <select
                                        value={currentItem.product_id}
                                        onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Sélectionner un produit</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({parseFloat(p.price).toFixed(2)} DH)
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentItem.quantity}
                                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                        className="w-20 border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold px-3 py-2 rounded-xl text-xs transition"
                                    >
                                        Ajouter
                                    </button>
                                </div>

                                {/* Liste des produits ajoutés */}
                                {form.items.length > 0 && (
                                    <div className="space-y-1.5 pt-2">
                                        {form.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                                                <span>{item.name} (x{item.quantity})</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">{(item.price * item.quantity).toFixed(2)} DH</span>
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center font-bold text-gray-800 text-base">
                                <span>Total:</span>
                                <span className="text-emerald-600">{newOrderTotal.toFixed(2)} DH</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="w-full border p-2 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
                                <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">Créer la commande</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Détails */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-lg font-bold text-gray-800">Détails Commande #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Client:</span> <strong>{selectedOrder.customer_name || selectedOrder.client_name || 'Client Passager'}</strong></p>
                            <p><span className="text-gray-500">Téléphone:</span> {selectedOrder.customer_phone || '-'}</p>
                            <p><span className="text-gray-500">Adresse:</span> {selectedOrder.shipping_address || '-'}</p>
                            <p><span className="text-gray-500">Statut:</span> <span className="capitalize font-semibold">{selectedOrder.status}</span></p>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="border-t pt-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Articles</p>
                                <div className="divide-y text-xs">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="py-2 flex justify-between">
                                            <span>{item.product?.name || item.name || `Produit #${item.product_id}`} (x{item.quantity})</span>
                                            <span className="font-semibold">{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)} DH</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-3 flex justify-between items-center font-bold text-gray-800">
                            <span>Total</span>
                            <span className="text-emerald-600 text-lg">{getOrderTotal(selectedOrder).toFixed(2)} DH</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}