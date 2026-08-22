import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, FolderPlus, Trash2, Tag } from 'lucide-react';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/categories');
            setCategories(res.data.data || res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des catégories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name, description });
            setName('');
            setDescription('');
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création de la catégorie');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de supprimer cette catégorie');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Catégories</h1>
                <p className="text-gray-500 text-sm">Organisez vos produits par catégories</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire d'ajout */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                        <FolderPlus className="w-5 h-5 text-emerald-600" />
                        <h2>Nouvelle Catégorie</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Soins du Visage"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description optionnelle..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-500"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Ajouter
                        </button>
                    </form>
                </div>

                {/* Liste des catégories */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4">Catégories existantes</h2>
                    {loading ? (
                        <p className="text-gray-400">Chargement...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-gray-400">Aucune catégorie trouvée.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-xl flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{cat.description || 'Pas de description'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-gray-400 hover:text-red-600 transition p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}