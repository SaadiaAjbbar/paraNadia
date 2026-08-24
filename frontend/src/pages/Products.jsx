import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Search, AlertCircle, Image as ImageIcon } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Produits</h1>
                    <p className="text-gray-500 text-sm">Gérez le catalogue et les stocks de votre parapharmacie</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-md"
                >
                    <Plus className="w-5 h-5" /> Nouveau Produit
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 bg-white"
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Produit</th>
                                <th className="p-4">Catégorie</th>
                                <th className="p-4">Prix</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {products.map((item) => {
                                const isLowStock = Number(item.stock) <= Number(item.min_stock);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            {item.image ? (
                                                <img src={`http://localhost:8000/storage/${item.image}`} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{item.category?.name || '-'}</td>
                                        <td className="p-4 font-semibold text-emerald-600">{item.price} DH</td>
                                        <td className="p-4">
                                            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                                                {item.stock} unités
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {isLowStock ? (
                                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Stock Bas
                                                </span>
                                            ) : (
                                                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    En Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Ajouter un produit</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nom du produit"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2.5 border rounded-xl"
                            />
                            <select
                                required
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full p-2.5 border rounded-xl bg-white"
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Prix"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="p-2.5 border rounded-xl"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="p-2.5 border rounded-xl"
                                />
                                <input
                                    type="number"
                                    placeholder="Min Stock"
                                    required
                                    value={formData.min_stock}
                                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                    className="p-2.5 border rounded-xl"
                                />
                            </div>
                            <input
                                type="file"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="w-full p-2 border rounded-xl text-sm"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium"
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