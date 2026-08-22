import { useEffect, useState } from 'react';
import api from '../api/axios';
import { DollarSign, ShoppingBag, Calendar, AlertTriangle } from 'lucide-react';

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
        return <div className="p-8 text-emerald-800 font-semibold">Chargement des statistiques...</div>;
    }

    const kpis = [
        { title: "Chiffre d'affaires", value: `${data?.kpis?.total_revenue || 0} DH`, icon: DollarSign, color: 'bg-emerald-500' },
        { title: 'Commandes', value: data?.kpis?.total_orders || 0, icon: ShoppingBag, color: 'bg-blue-500' },
        { title: 'Réservations', value: data?.kpis?.total_reservations || 0, icon: Calendar, color: 'bg-purple-500' },
        { title: 'Alerte Stock', value: data?.low_stock_alert?.length || 0, icon: AlertTriangle, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
                <p className="text-gray-500 text-sm">Vue d'ensemble sur l'activité de la parapharmacie</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{kpi.value}</p>
                            </div>
                            <div className={`${kpi.color} p-3 rounded-xl text-white shadow-md`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}u