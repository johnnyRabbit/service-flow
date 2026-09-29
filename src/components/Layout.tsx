import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, ClipboardList, Wrench, Calendar, 
  Zap, Shield, Settings, LogOut, Snowflake, Bell
} from 'lucide-react';
import { mockOrganization } from '../data/mockData';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Pedidos', href: '/requests', icon: ClipboardList },
  { name: 'Serviços', href: '/services', icon: Wrench },
  { name: 'Marcações', href: '/appointments', icon: Calendar },
  { name: 'Automações', href: '/automations', icon: Zap },
  { name: 'Audit Log', href: '/audit', icon: Shield },
  { name: 'Definições', href: '/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">{mockOrganization.name}</h1>
              <p className="text-xs text-gray-500">ServiceFlow AI</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/inbox' && location.pathname.startsWith('/inbox/'));
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
                {item.name === 'Inbox' && (
                  <span className="ml-auto bg-danger-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-xs font-bold">AT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@climatech.pt</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">IA Ativa</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
