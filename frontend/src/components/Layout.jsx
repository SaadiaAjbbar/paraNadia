import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Calendar,
    Layers,
    LogOut,
    DollarSign,
    Settings as SettingsIcon
} from 'lucide-react';

export default function Layout({ onLogout }) {
    const location = useLocation();

    const navItems = [
        { name: 'Ventes', path: '/sales', icon: DollarSign },
        { name: 'Tableau de bord', path: '/', icon: LayoutDashboard },
        { name: 'Produits', path: '/products', icon: Package },
        { name: 'Catégories', path: '/categories', icon: Layers },
        { name: 'Commandes', path: '/orders', icon: ShoppingCart },
        { name: 'Réservations', path: '/reservations', icon: Calendar },
        { name: 'Paramètres', path: '/settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-emerald-900 text-white flex flex-col justify-between">
                <div>
                    <div className="p-6 text-center border-b border-emerald-800">
                        <h1 className="text-xl font-bold text-emerald-100">Parapharmacie</h1>
                        <p className="text-xs text-emerald-400 mt-1">Espace Admin</p>
                    </div>

                    <nav className="mt-6 px-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
                                        ? 'bg-emerald-700 text-white shadow-md'
                                        : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-emerald-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition shadow"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}