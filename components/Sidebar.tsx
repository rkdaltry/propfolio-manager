import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants/designSystem';
import { LogOut, UserCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PropFolio</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-2">Menu</div>
        {NAV_ITEMS.filter(item => item.label !== 'Settings').map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={20} className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {NAV_ITEMS.filter(item => item.label === 'Settings').map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-semibold'
              : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-200'
              }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-2 mt-2 border-t border-slate-200/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors group">
            <LogOut size={20} className="group-hover:text-red-500" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 mt-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
            <UserCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">Rashed Khan</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
