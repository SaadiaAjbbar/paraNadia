import { useEffect, useState } from 'react';
import api from '../api/axios';
import { DollarSign, ShoppingBag, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats')
            .then((res) => setData(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-blue-400 font-semibold animate-pulse">Chargement des statistiques...</div>;
    }

    const kpis = [
        {
            title: "Chiffre d'affaires",
            value: `${data?.kpis?.total_revenue || 0} DH`,
            icon: DollarSign,
            gradient: 'from-blue-600 to-indigo-600',
            shadow: 'shadow-blue-500/20'
        },
        {
            title: 'Commandes',
            value: data?.kpis?.total_orders || 0,
            icon: ShoppingBag,
            gradient: 'from-indigo-600 to-purple-600',
            shadow: 'shadow-indigo-500/20'
        },
        {
            title: 'Réservations',
            value: data?.kpis?.total_reservations || 0,
            icon: Calendar,
            gradient: 'from-cyan-600 to-blue-600',
            shadow: 'shadow-cyan-500/20'
        },
        {
            title: 'Alerte Stock',
            value: data?.low_stock_alert?.length || 0,
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20'
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Tableau de bord</h1>
                    <p className="text-slate-400 text-sm mt-1">Vue d'ensemble sur l'activité de la parapharmacie</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Mise à jour en temps réel</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 flex items-center justify-between hover:border-slate-700 transition duration-300 group"
                        >
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</p>
                                <p className="text-2xl font-bold text-white mt-2 group-hover:scale-105 transition-transform">{kpi.value}</p>
                            </div>
                            <div className={`bg-gradient-to-tr ${kpi.gradient} p-3.5 rounded-2xl text-white shadow-lg ${kpi.shadow}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}