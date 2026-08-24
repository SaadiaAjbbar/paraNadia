import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, ShoppingBag, Printer, X, Receipt } from 'lucide-react';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [paraInfo, setParaInfo] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [invoiceSale, setInvoiceSale] = useState(null);

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
            setInvoiceSale(createdOrder);

        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l’enregistrement de la vente');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestion des Ventes</h1>
                    <p className="text-slate-400 text-sm mt-1">Enregistrement et suivi des ventes directes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" /> Nouvelle Vente
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden print:hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse">Chargement des ventes...</div>
                ) : sales.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Aucune vente enregistrée</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4">Réf / Client</th>
                                    <th className="p-4">Mode de paiement</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-center">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-100">#{sale.id} - {sale.customer_name || 'Client Passager'}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                                                {sale.payment_type || 'Espèces'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">
                                            {sale.created_at ? new Date(sale.created_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-100">
                                            {getSaleTotal(sale).toFixed(2)} <span className="text-blue-400 text-xs font-normal">DH</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setInvoiceSale(sale)}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition"
                                                title="Imprimer Facture"
                                            >
                                                <Printer className="w-4 h-4 mx-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Vente */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 print:hidden">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                Enregistrer une Vente
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nom du Client</label>
                                <input
                                    type="text"
                                    required
                                    value={form.customer_name}
                                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Produit</label>
                                <select
                                    required
                                    value={form.product_id}
                                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {parseFloat(p.price).toFixed(2)} DH (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantité</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Paiement</label>
                                    <select
                                        value={form.payment_type}
                                        onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                    >
                                        <option value="Espèces">Espèces</option>
                                        <option value="Carte">Carte Bancaire</option>
                                        <option value="Virement">Virement</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Prix Unitaire</p>
                                    <p className="text-sm font-semibold text-slate-200 mt-0.5">{unitPrice.toFixed(2)} DH</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium">Total à Payer</p>
                                    <p className="text-xl font-extrabold text-blue-400 mt-0.5">{calculatedTotal} DH</p>
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
                                    Valider & Facturer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal / Vue Facture à Imprimer */}
            {invoiceSale && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 print:p-0 print:static print:bg-white print:backdrop-none">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 print:shadow-none print:w-full print:max-w-none print:p-0 print:bg-white print:border-none print:text-black">

                        {/* Header Actions (hidden on print) */}
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800 print:hidden">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-blue-400" />
                                Facture / Reçu de Vente
                            </h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handlePrintInvoice} 
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-blue-600/25"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Imprimer
                                </button>
                                <button 
                                    onClick={() => setInvoiceSale(null)} 
                                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Ticket / Facture */}
                        <div className="text-xs space-y-4 border border-slate-800 p-5 rounded-2xl bg-slate-950 print:bg-white print:text-black print:border-none print:p-0">
                            <div className="text-center space-y-1 border-b border-slate-800 print:border-gray-200 pb-3">
                                <h2 className="text-base font-extrabold uppercase tracking-wide text-blue-400 print:text-black">{paraInfo.name || 'Ma Parapharmacie'}</h2>
                                <p className="text-slate-400 print:text-gray-600">{paraInfo.address || 'Adresse non renseignée'}</p>
                                <p className="text-slate-400 print:text-gray-600">Tél: {paraInfo.phone || '0500000000'}</p>
                                {paraInfo.ice && <p className="text-slate-500 print:text-gray-500 text-[10px]">ICE: {paraInfo.ice}</p>}
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-300 print:text-gray-700 border-b border-slate-800 print:border-gray-200 pb-3">
                                <div>
                                    <p><strong className="text-slate-200 print:text-black">Facture N°:</strong> #{invoiceSale.id || 'N/A'}</p>
                                    <p><strong className="text-slate-200 print:text-black">Client:</strong> {invoiceSale.customer_name || 'Client Passager'}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong className="text-slate-200 print:text-black">Date:</strong> {invoiceSale.created_at ? new Date(invoiceSale.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
                                    <p><strong className="text-slate-200 print:text-black">Paiement:</strong> {invoiceSale.payment_type || 'Espèces'}</p>
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 print:border-gray-200 text-[10px] text-slate-400 print:text-gray-500 uppercase">
                                        <th className="py-2">Article</th>
                                        <th className="py-2 text-center">Qté</th>
                                        <th className="py-2 text-right">P.U</th>
                                        <th className="py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200 text-slate-200 print:text-black">
                                    {invoiceSale.items && invoiceSale.items.length > 0 ? (
                                        invoiceSale.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-2 font-medium">{item.product?.name || item.name || `Produit #${item.product_id}`}</td>
                                                <td className="py-2 text-center">{item.quantity}</td>
                                                <td className="py-2 text-right">{parseFloat(item.price || item.unit_price || 0).toFixed(2)}</td>
                                                <td className="py-2 text-right font-semibold">{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)} DH</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="py-2 font-medium">{invoiceSale.product_name || 'Article'}</td>
                                            <td className="py-2 text-center">{invoiceSale.quantity || 1}</td>
                                            <td className="py-2 text-right">{getSaleTotal(invoiceSale).toFixed(2)}</td>
                                            <td className="py-2 text-right font-semibold">{getSaleTotal(invoiceSale).toFixed(2)} DH</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="border-t border-slate-800 print:border-gray-200 pt-3 flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-200 print:text-black">TOTAL A PAYER:</span>
                                <span className="text-blue-400 print:text-black text-base">{getSaleTotal(invoiceSale).toFixed(2)} DH</span>
                            </div>

                            <div className="text-center pt-4 text-slate-500 print:text-gray-500 text-[10px] border-t border-slate-800 print:border-gray-200 space-y-0.5">
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