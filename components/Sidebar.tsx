import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants/designSystem';
import { LogOut, UserCircle, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`h-screen w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/50' : '-translate-x-full'}`}>
      {/* Logo Section */}
      <div className="p-8 flex justify-between items-center">
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tighter leading-none">PropFolio</h1>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mt-1">Manager</p>
          </div>
        </div>

        {/* Close Button for Mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2 scrollbar-none">
        <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-4 mb-4">Main Menu</div>
        {NAV_ITEMS.filter(item => item.label !== 'Settings').map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active
                ? 'nav-item-active text-white'
                : 'nav-item-hover text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
            >
              <item.icon size={20} className={`transition-colors duration-300 ${active ? 'text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`} />
              <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
              {active && (
                <div className="ml-auto">
                  <ChevronRight size={16} className="opacity-70" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-6 pb-8">
        {NAV_ITEMS.filter(item => item.label === 'Settings').map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive(item.path)
              ? 'nav-item-active text-white'
              : 'nav-item-hover text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            onClick={() => {
              if (window.innerWidth < 1024) onClose?.();
            }}
          >
            <item.icon size={20} className={`transition-colors duration-300 ${isActive(item.path) ? 'text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`} />
            <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
          </Link>
        ))}

        <button className="flex items-center gap-3.5 px-4 py-3.5 w-full rounded-2xl text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group mt-2">
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[15px] font-medium tracking-tight">Sign Out</span>
        </button>

        <div className="flex items-center gap-4 px-4 py-4 mt-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/30">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <UserCircle size={24} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">Rashed Khan</p>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
