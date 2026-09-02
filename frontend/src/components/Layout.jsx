import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Calendar,
    Layers,
    LogOut,
    DollarSign,
    Settings as SettingsIcon,
} from 'lucide-react';

export default function Layout({ onLogout }) {
    const location = useLocation();

    // جلب بيانات المستخدم المسجل من LocalStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role || 'vendeuse'; // افتراضي إذا لم يوجد

    // قائمة الروابط الكاملة مع تحديد الـ roles المسموح لها
    const allNavItems = [
        { name: 'Ventes', path: '/sales', icon: DollarSign, roles: ['admin', 'vendeuse'] },
        { name: 'Tableau de bord', path: '/', icon: LayoutDashboard, roles: ['admin'] },
        { name: 'Produits', path: '/products', icon: Package, roles: ['admin', 'vendeuse'] },
        { name: 'Catégories', path: '/categories', icon: Layers, roles: ['admin', 'vendeuse'] },
        { name: 'Commandes', path: '/orders', icon: ShoppingCart, roles: ['admin', 'vendeuse'] },
        { name: 'Réservations', path: '/reservations', icon: Calendar, roles: ['admin', 'vendeuse'] },
        { name: 'Paramètres', path: '/settings', icon: SettingsIcon, roles: ['admin'] },
    ];

    // تصفية العناصر الظاهرة حسب دور المستخدم الحقيقي
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans antialiased">
            {/* Sidebar Dark Blue Gradient */}
            <aside className="w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 border-r border-slate-800/80 flex flex-col justify-between shadow-2xl relative z-20 print:hidden">
                <div>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                    Parapharmacie NADIA
                                </h1>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold border rounded-full capitalize ${userRole === 'admin'
                                        ? 'text-blue-400 bg-blue-950/80 border-blue-800/50'
                                        : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/50'
                                    }`}>
                                    {userRole === 'admin' ? 'Espace Admin' : 'Espace Vendeuse'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-6 px-4 space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-md space-y-3">
                    <div className="px-2 text-xs">
                        <p className="text-slate-400">Connecté en tant que:</p>
                        <p className="text-slate-200 font-semibold truncate">{user.name || 'Utilisateur'}</p>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 border border-rose-500/20 hover:border-transparent shadow-sm hover:shadow-rose-600/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-slate-950/50 p-8 overflow-y-auto relative">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}