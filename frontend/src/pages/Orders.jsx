import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingBag, Eye, Trash2, Plus, X, Phone, MapPin, User, Calendar, CreditCard } from 'lucide-react';

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
        <div className="space-y-8">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestion des Commandes</h1>
                    <p className="text-slate-400 text-sm mt-1">Suivi, création et modification des commandes clients</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" /> Nouvelle Commande
                </button>
            </div>

            {/* Main Table Container */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse">Chargement des commandes...</div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Aucune commande trouvée</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4">Réf / Client</th>
                                    <th className="p-4">Téléphone / Adresse</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-blue-400">#{order.id}</p>
                                            <p className="text-slate-200 font-medium">{order.customer_name || order.client_name || order.user?.name || 'Client Passager'}</p>
                                        </td>
                                        <td className="p-4 text-xs text-slate-400 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{order.customer_phone || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 max-w-[180px] truncate">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{order.shipping_address || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-100">
                                            {getOrderTotal(order).toFixed(2)} <span className="text-blue-400 text-xs font-normal">DH</span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={order.status || 'pending'}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`text-xs border rounded-xl px-3 py-1.5 bg-slate-950 outline-none font-semibold transition cursor-pointer ${order.status === 'completed'
                                                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                                                        : order.status === 'cancelled'
                                                            ? 'border-rose-500/30 text-rose-400 bg-rose-950/20'
                                                            : 'border-amber-500/30 text-amber-400 bg-amber-950/20'
                                                    }`}
                                            >
                                                <option value="pending" className="bg-slate-900 text-amber-400">En attente</option>
                                                <option value="completed" className="bg-slate-900 text-emerald-400">Livrée / Payée</option>
                                                <option value="cancelled" className="bg-slate-900 text-rose-400">Annulée</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition"
                                                    title="Détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Création */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                Nouvelle Commande
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Client</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.customer_name}
                                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                        placeholder="Nom complet"
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Téléphone</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.customer_phone}
                                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                        placeholder="06XXXXXXXX"
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Adresse de Livraison</label>
                                <input
                                    type="text"
                                    required
                                    value={form.shipping_address}
                                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                                    placeholder="Adresse complète"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            {/* Section Ajouter Produit */}
                            <div className="border-t border-b border-slate-800 py-4 space-y-3">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Sélectionner les produits</label>
                                <div className="flex gap-2">
                                    <select
                                        value={currentItem.product_id}
                                        onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
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
                                        className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm text-center focus:outline-none focus:border-blue-500 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold px-4 py-2 rounded-xl text-xs border border-blue-500/30 transition duration-300"
                                    >
                                        Ajouter
                                    </button>
                                </div>

                                {/* Liste des produits ajoutés */}
                                {form.items.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        {form.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-xs bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                                                <span className="text-slate-200 font-medium">{item.name} <span className="text-blue-400 font-bold">(x{item.quantity})</span></span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-100">{(item.price * item.quantity).toFixed(2)} DH</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-slate-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg transition"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center font-bold text-slate-100 text-base py-1">
                                <span>Total:</span>
                                <span className="text-blue-400 text-xl font-extrabold">{newOrderTotal.toFixed(2)} DH</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-full border border-slate-800 text-slate-300 hover:bg-slate-800 py-3 rounded-xl text-sm font-semibold transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 transition"
                                >
                                    Créer la commande
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Détails */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">Détails Commande</h2>
                                <p className="text-xs text-blue-400 font-semibold mt-0.5">#{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                            <div className="flex items-center gap-2 text-slate-300">
                                <User className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-500">Client:</span>
                                <strong className="text-slate-100 font-semibold">{selectedOrder.customer_name || selectedOrder.client_name || 'Client Passager'}</strong>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Phone className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-500">Téléphone:</span>
                                <span className="text-slate-200">{selectedOrder.customer_phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-500">Adresse:</span>
                                <span className="text-slate-200">{selectedOrder.shipping_address || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <CreditCard className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-500">Statut:</span>
                                <span className="capitalize font-bold text-blue-400">{selectedOrder.status}</span>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Articles</p>
                                <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                                            <span className="text-slate-300">{item.product?.name || item.name || `Produit #${item.product_id}`} <span className="text-slate-500 font-bold">(x{item.quantity})</span></span>
                                            <span className="font-semibold text-slate-100">{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)} DH</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                            <span className="font-bold text-slate-300">Total الإجمالي</span>
                            <span className="text-blue-400 text-xl font-extrabold">{getOrderTotal(selectedOrder).toFixed(2)} DH</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}