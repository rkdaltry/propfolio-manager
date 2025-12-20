import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants/designSystem';
import ThemeToggle from './ThemeToggle';
import { UserCircle, Bell, Menu, LogOut, Search } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { logout } from '../services/authService';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const location = useLocation();
    const { user } = useAuth();

    const getPageTitle = () => {
        const item = NAV_ITEMS.find(item => item.path === location.pathname);
        if (item) return item.label;
        if (location.pathname.startsWith('/properties/')) return 'Property Details';
        return 'Dashboard';
    };

    return (
        <header className="glass-header h-20 px-6 lg:px-16 xl:px-24 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/50 transition-all duration-300 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <button
                    onClick={onMenuClick}
                    className="p-3 rounded-2xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all lg:hidden active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none uppercase italic">
                        {getPageTitle()}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">System Operational</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-center px-8">
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="w-full max-w-md px-5 py-2.5 rounded-2xl text-slate-500 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/20 transition-all hidden sm:flex items-center gap-3 group"
                >
                    <Search size={18} className="group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex-1 text-left">Enterprise Search...</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-black shadow-sm">
                        <span className="opacity-50 tracking-tighter">CMD</span>
                        <span className="text-blue-500">K</span>
                    </div>
                </button>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                <button className="p-3 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500 transition-all relative group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 shadow-sm animate-bounce"></span>
                </button>

                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800/50 hidden md:block"></div>

                <ThemeToggle />

                <div className="flex items-center gap-3 pl-2">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group cursor-pointer active:scale-95">
                        <div className="text-right hidden xl:block">
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate max-w-[120px] uppercase tracking-tight">
                                {user?.displayName || 'Administrator'}
                            </p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-0.5">Premium Tier</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 border-2 border-white dark:border-slate-800 overflow-hidden group-hover:rotate-3 transition-transform">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-lg">{(user?.displayName || 'A').charAt(0)}</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        title="Secure Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
