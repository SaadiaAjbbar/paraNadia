import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, FolderPlus, Trash2, Tag, Sparkles } from 'lucide-react';

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestion des Catégories</h1>
                <p className="text-slate-400 text-sm mt-1">Organisez vos produits par catégories facilement</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulaire d'ajout */}
                <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 h-fit">
                    <div className="flex items-center gap-3 font-bold text-white mb-6 pb-4 border-b border-slate-800">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg">Nouvelle Catégorie</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nom</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Soins du Visage"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                            <textarea
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description optionnelle..."
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" /> Ajouter
                        </button>
                    </form>
                </div>

                {/* Liste des catégories */}
                <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
                    <h2 className="font-bold text-white text-lg mb-6 pb-4 border-b border-slate-800">Catégories existantes</h2>
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse">Chargement...</div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Aucune catégorie trouvée.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="p-5 border border-slate-800 bg-slate-950/60 rounded-xl flex items-start justify-between hover:border-slate-700 transition group">
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-100">{cat.name}</h3>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description || 'Pas de description'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-slate-500 hover:text-rose-400 transition p-1.5 hover:bg-rose-500/10 rounded-lg"
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