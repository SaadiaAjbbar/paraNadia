import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Plus, CreditCard, DollarSign, Landmark, ShoppingBag, Package, Printer, X } from 'lucide-react';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [paraInfo, setParaInfo] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [invoiceSale, setInvoiceSale] = useState(null); // Facture sélectionnée

    const [form, setForm] = useState({
        product_id: '',
        quantity: 1,
        payment_type: 'Espèces',
        customer_name: 'Client Passager',
        customer_phone: '0600000000',
        shipping_address: 'Vente Directe (Sur place)'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, prodRes, paraRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products'),
                api.get('/parapharmacy-settings').catch(() => ({ data: {} }))
            ]);

            setSales(ordersRes.data.data || ordersRes.data || []);
            setProducts(prodRes.data.data || prodRes.data || []);
            if (paraRes.data) {
                setParaInfo(paraRes.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedProduct = products.find(p => p.id === parseInt(form.product_id));
    const unitPrice = selectedProduct ? parseFloat(selectedProduct.price) : 0;
    const calculatedTotal = (unitPrice * (parseInt(form.quantity) || 1)).toFixed(2);

    const getSaleTotal = (sale) => {
        const rawTotal = sale.total_price ?? sale.total ?? sale.total_amount ?? sale.grand_total;
        if (rawTotal !== undefined && rawTotal !== null && parseFloat(rawTotal) > 0) {
            return parseFloat(rawTotal);
        }
        if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
            return sale.items.reduce((sum, item) => {
                const itemPrice = parseFloat(item.price ?? item.unit_price ?? 0);
                const itemQty = parseInt(item.quantity ?? 1);
                return sum + (itemPrice * itemQty);
            }, 0);
        }
        return 0;
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!selectedProduct) {
                alert('Veuillez sélectionner un produit valide');
                return;
            }

            const qty = parseInt(form.quantity);
            if (selectedProduct.stock < qty) {
                alert(`Stock insuffisant ! Stock disponible: ${selectedProduct.stock}`);
                return;
            }

            const totalPrice = parseFloat(calculatedTotal);

            const payload = {
                customer_name: form.customer_name || 'Client Passager',
                customer_phone: form.customer_phone || '0600000000',
                shipping_address: form.shipping_address || 'Vente Directe (Sur place)',
                payment_type: form.payment_type,
                status: 'completed',
                total: totalPrice,
                total_price: totalPrice,
                total_amount: totalPrice,
                items: [
                    {
                        product_id: selectedProduct.id,
                        quantity: qty,
                        price: unitPrice,
                        unit_price: unitPrice,
                        total_price: totalPrice,
                        product: selectedProduct
                    }
                ]
            };

            const res = await api.post('/orders', payload);
            const createdOrder = res.data.data || res.data || payload;

            // تحديث الـ Stock
            const newStock = selectedProduct.stock - qty;
            try {
                await api.post(`/products/${selectedProduct.id}`, {
                    _method: 'PUT',
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    category_id: selectedProduct.category_id,
                    stock: newStock,
                    min_stock: selectedProduct.min_stock
                });
            } catch (e) {
                console.warn('Stock update fall-back');
            }

            setShowModal(false);
            setForm({
                product_id: '',
                quantity: 1,
                payment_type: 'Espèces',
                customer_name: 'Client Passager',
                customer_phone: '0600000000',
                shipping_address: 'Vente Directe (Sur place)'
            });

            await fetchData();

            // إظهار الفاتورة فوراً للطباعة بعد نجاح البيع
            setInvoiceSale(createdOrder);

        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l’enregistrement de la vente');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Ventes</h1>
                    <p className="text-gray-500 text-sm">Enregistrement et suivi des ventes directes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Vente
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement des ventes...</div>
                ) : sales.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Aucune vente enregistrée</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Réf / Client</th>
                                <th className="p-4">Mode de paiement</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4 text-center">Facture</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">#{sale.id} - {sale.customer_name || 'Client Passager'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                            {sale.payment_type || 'Espèces'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {sale.created_at ? new Date(sale.created_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                                    </td>
                                    <td className="p-4 font-bold text-emerald-600">
                                        {getSaleTotal(sale).toFixed(2)} DH
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setInvoiceSale(sale)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            title="Imprimer Facture"
                                        >
                                            <Printer className="w-4 h-4 mx-auto" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Vente */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-emerald-600" />
                            Enregistrer une Vente
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
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
                                <label className="block text-xs font-medium text-gray-600 mb-1">Produit</label>
                                <select
                                    required
                                    value={form.product_id}
                                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                    className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {parseFloat(p.price).toFixed(2)} DH (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Paiement</label>
                                    <select
                                        value={form.payment_type}
                                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                                        className="w-full border p-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    >
                                        <option value="Espèces">Espèces</option>
                                        <option value="Carte">Carte Bancaire</option>
                                        <option value="Virement">Virement</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-emerald-900">
                                <div>
                                    <p className="text-xs text-emerald-600 font-medium">Prix Unitaire</p>
                                    <p className="text-sm font-semibold">{unitPrice.toFixed(2)} DH</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-600 font-medium">Total à Payer</p>
                                    <p className="text-lg font-bold text-emerald-700">{calculatedTotal} DH</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="w-full border p-2 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
                                <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">Valider & Facturer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal / Vue Facture à Imprimer */}
            {invoiceSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:p-0 print:static print:bg-white">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 print:shadow-none print:w-full print:max-w-none print:p-0">

                        {/* Header Actions (hidden on print) */}
                        <div className="flex justify-between items-center border-b pb-3 print:hidden">
                            <h2 className="font-bold text-gray-800">Facture / Reçu de Vente</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrintInvoice} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                                    <Printer className="w-3.5 h-3.5" /> Imprimer
                                </button>
                                <button onClick={() => setInvoiceSale(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Ticket / Facture */}
                        <div className="text-xs text-gray-800 space-y-4 border p-4 rounded-xl print:border-none print:p-0">
                            <div className="text-center space-y-1 border-b pb-3">
                                <h2 className="text-base font-bold uppercase tracking-wide text-emerald-700">{paraInfo.name || 'Ma Parapharmacie'}</h2>
                                <p className="text-gray-500">{paraInfo.address || 'Adresse non renseignée'}</p>
                                <p className="text-gray-500">Tél: {paraInfo.phone || '0500000000'}</p>
                                {paraInfo.ice && <p className="text-gray-400 text-[10px]">ICE: {paraInfo.ice}</p>}
                            </div>

                            <div className="flex justify-between text-[11px] text-gray-600 border-b pb-2">
                                <div>
                                    <p><strong>Facture N°:</strong> #{invoiceSale.id || 'N/A'}</p>
                                    <p><strong>Client:</strong> {invoiceSale.customer_name || 'Client Passager'}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Date:</strong> {invoiceSale.created_at ? new Date(invoiceSale.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Paiement:</strong> {invoiceSale.payment_type || 'Espèces'}</p>
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-[10px] text-gray-500 uppercase">
                                        <th className="py-1">Article</th>
                                        <th className="py-1 text-center">Qté</th>
                                        <th className="py-1 text-right">P.U</th>
                                        <th className="py-1 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invoiceSale.items && invoiceSale.items.length > 0 ? (
                                        invoiceSale.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-1.5 font-medium">{item.product?.name || item.name || `Produit #${item.product_id}`}</td>
                                                <td className="py-1.5 text-center">{item.quantity}</td>
                                                <td className="py-1.5 text-right">{parseFloat(item.price || item.unit_price || 0).toFixed(2)}</td>
                                                <td className="py-1.5 text-right font-semibold">{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)} DH</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="py-1.5 font-medium">{invoiceSale.product_name || 'Article'}</td>
                                            <td className="py-1.5 text-center">{invoiceSale.quantity || 1}</td>
                                            <td className="py-1.5 text-right">{getSaleTotal(invoiceSale).toFixed(2)}</td>
                                            <td className="py-1.5 text-right font-semibold">{getSaleTotal(invoiceSale).toFixed(2)} DH</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="border-t pt-2 flex justify-between items-center text-sm font-bold">
                                <span>TOTAL A PAYER:</span>
                                <span className="text-emerald-700">{getSaleTotal(invoiceSale).toFixed(2)} DH</span>
                            </div>

                            <div className="text-center pt-4 text-gray-400 text-[10px] border-t">
                                <p>Merci pour votre visite !</p>
                                <p>Les articles vendus ne sont ni repris ni échangés.</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}