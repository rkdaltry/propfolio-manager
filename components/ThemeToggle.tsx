import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const ThemeToggle: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm border border-slate-200 dark:border-slate-800 active:scale-90 group"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <Sun size={20} className="text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
                <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
