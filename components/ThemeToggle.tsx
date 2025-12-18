import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const ThemeToggle: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 shadow-sm border border-slate-200"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <Sun size={20} className="text-amber-400 animate-in fade-in spin-in-90 duration-300" />
            ) : (
                <Moon size={20} className="text-blue-600 animate-in fade-in spin-in-90 duration-300" />
            )}
        </button>
    );
};

export default ThemeToggle;
