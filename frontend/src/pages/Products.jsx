import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Search, AlertCircle, Image as ImageIcon, X, Package } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        stock: '',
        min_stock: 5,
        description: '',
        image: null,
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products', {
                params: { search, category_id: selectedCategory }
            });
            setProducts(res.data.data || res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des produits', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data || res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des catégories', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, selectedCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setFormData({ name: '', category_id: '', price: '', stock: '', min_stock: 5, description: '', image: null });
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création du produit');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestion des Produits</h1>
                    <p className="text-slate-400 text-sm mt-1">Gérez le catalogue et les stocks de votre parapharmacie</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" /> Nouveau Produit
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse">Chargement des produits...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4">Produit</th>
                                    <th className="p-4">Catégorie</th>
                                    <th className="p-4">Prix</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {products.map((item) => {
                                    const isLowStock = Number(item.stock) <= Number(item.min_stock);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                                            <td className="p-4 flex items-center gap-3.5">
                                                {item.image ? (
                                                    <img src={`http://localhost:8000/storage/${item.image}`} alt={item.name} className="w-11 h-11 rounded-xl object-cover border border-slate-800" />
                                                ) : (
                                                    <div className="w-11 h-11 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-100">{item.name}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{item.description || 'Pas de description'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300 font-medium">{item.category?.name || '-'}</td>
                                            <td className="p-4 font-bold text-slate-100">
                                                {item.price} <span className="text-blue-400 text-xs font-normal">DH</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${isLowStock ? 'text-rose-400' : 'text-slate-300'}`}>
                                                    {item.stock} <span className="text-xs font-normal text-slate-500">unités</span>
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {isLowStock ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-rose-950/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Stock Bas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                                                        En Stock
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <Package className="w-5 h-5" />
                                </div>
                                Ajouter un produit
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nom du produit</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Crème Hydratante"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Catégorie</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Prix (DH)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Stock</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Min Stock</label>
                                    <input
                                        type="number"
                                        placeholder="5"
                                        required
                                        value={formData.min_stock}
                                        onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Image du produit</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600 hover:file:text-white file:transition cursor-pointer"
                                />
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