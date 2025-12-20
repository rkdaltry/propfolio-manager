import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants/designSystem';
import { LogOut, UserCircle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { logout } from '../services/authService';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`h-screen w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col fixed left-0 top-0 z-50 transition-all duration-500 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-slate-950/50' : '-translate-x-full'}`}>
      {/* Logo Section */}
      <div className="p-10 flex justify-between items-center group cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[1.25rem] flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span className="text-white font-black text-2xl tracking-tighter italic">P</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase italic">PropFolio</h1>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-1.5">
              MANAGER <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Close Button for Mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-all hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2 overflow-y-auto pt-4 scrollbar-hidden">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-4 mb-6 flex items-center gap-3">
          <span>Main Infrastructure</span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
        </div>
        {NAV_ITEMS.filter(item => item.label !== 'Settings').map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl shadow-slate-900/10 dark:shadow-white/5'
                : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500" />}
              <item.icon size={20} className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-600'}`} />
              <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
              {active && (
                <div className="ml-auto">
                  <ChevronRight size={16} className="opacity-50" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 mt-auto space-y-3 border-t border-slate-100 dark:border-slate-800/50 pt-8 pb-10 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-md">
        {NAV_ITEMS.filter(item => item.label === 'Settings').map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive(item.path)
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-lg'
              : 'text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            onClick={() => {
              if (window.innerWidth < 1024) onClose?.();
            }}
          >
            <item.icon size={20} className={`transition-all duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}

        <button
          onClick={() => logout()}
          className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group mt-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
        </button>

        <div className="relative group px-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center gap-4 px-5 py-5 bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/60 dark:border-slate-800 shadow-sm group-hover:shadow-xl transition-all">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 shadow-inner border border-white dark:border-slate-800">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <UserCircle size={26} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight uppercase italic">{user?.displayName || 'Administrator'}</p>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] mt-0.5">Premium Tier</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
