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
        <header className="glass-header h-18 px-4 lg:px-8 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 rounded-xl text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden active:scale-95"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate max-w-[200px] sm:max-w-none">
                    {getPageTitle()}
                </h2>
            </div>

            <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-2 group"
                title="Search (Cmd+K)"
            >
                <Search size={20} className="group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-400">Search...</span>
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-black opacity-60">
                    <span>⌘</span>
                    <span>K</span>
                </div>
            </button>

            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative hidden sm:block">
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <ThemeToggle />

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm group">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-50 leading-tight truncate max-w-[120px]">
                            {user?.displayName || 'User'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">Account</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border-2 border-white dark:border-slate-800 overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={24} />
                        )}
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header >
    );
};

export default Header;
