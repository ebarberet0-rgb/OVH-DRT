import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Mail,
  FileText,
  Bike,
  LogOut,
  Settings,
  Users,
  Store,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'DEALER'],
  },
  {
    label: 'Événements',
    path: '/events',
    icon: Calendar,
    roles: ['ADMIN', 'DEALER', 'INSTRUCTOR'],
  },
  {
    label: 'Réservations',
    path: '/bookings',
    icon: ClipboardList,
    roles: ['ADMIN', 'DEALER'],
  },
  {
    label: 'Statistiques Site',
    path: '/stats/website',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
  {
    label: 'Envoyer des emails',
    path: '/emails',
    icon: Mail,
    roles: ['ADMIN', 'DEALER'],
  },
  {
    label: 'Formulaires Clients',
    path: '/forms/customers',
    icon: FileText,
    roles: ['ADMIN', 'DEALER'],
  },
  {
    label: 'Formulaires Concessionnaires',
    path: '/forms/dealers',
    icon: Store,
    roles: ['ADMIN'],
  },
  {
    label: 'Rapports Équipe DRT',
    path: '/forms/drt-team',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
  {
    label: 'Gestion Motos',
    path: '/motorcycles',
    icon: Bike,
    roles: ['ADMIN'],
  },
  {
    label: 'Utilisateurs',
    path: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    label: 'Concessions',
    path: '/dealers',
    icon: Store,
    roles: ['ADMIN'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 bg-yamaha-blue text-white h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">Yamaha DRT</h1>
        <p className="text-sm text-gray-300">Back Office 2026</p>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-white/5">
        <p className="text-sm font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-gray-300">{user?.email}</p>
        <p className="text-xs text-yamaha-red mt-1">
          {user?.role === 'ADMIN'
            ? 'Administrateur'
            : user?.role === 'INSTRUCTOR'
              ? 'Instructeur'
              : 'Concessionnaire'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-yamaha-red text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Paramètres</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
