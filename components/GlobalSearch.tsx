import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Users, FileText, ChevronRight, Hash, Command, X } from 'lucide-react';
import { useData } from '../DataContext';
import { useNavigate } from 'react-router-dom';

const GlobalSearch: React.FC = () => {
    const { properties } = useData();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const results = query.length > 0 ? [
        ...properties.filter(p => p.address.toLowerCase().includes(query.toLowerCase())).map(p => ({
            type: 'property',
            id: p.id,
            title: p.address.split(',')[0],
            subtitle: p.postcode,
            icon: Building2,
            path: `/properties/${p.id}`
        })),
        ...properties.flatMap(p => p.tenants).filter(t => t.name.toLowerCase().includes(query.toLowerCase())).map(t => ({
            type: 'tenant',
            id: t.id,
            title: t.name,
            subtitle: `Tenant @ ${properties.find(p => p.tenants.some(pt => pt.id === t.id))?.address.split(',')[0]}`,
            icon: Users,
            path: '/tenants'
        }))
    ].slice(0, 8) : [];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const handleSelect = (result: any) => {
        navigate(result.path);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Search Container */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-slide-up">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Search size={24} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search assets, tenants, or commands..."
                        className="flex-1 bg-transparent text-xl font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest">
                        <Command size={14} />
                        <span>K</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto scrollbar-none">
                    {query.length === 0 ? (
                        <div className="p-10 text-center space-y-4">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] w-fit mx-auto opacity-40">
                                <Search size={48} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-bold">Start typing to search your portfolio</p>
                            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto opacity-60">
                                {['Properties', 'Tenants', 'Leases', 'Invoices'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((result, index) => {
                                const Icon = result.icon;
                                const isSelected = index === selectedIndex;
                                return (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50'}`}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[15px] truncate tracking-tight">{result.title}</p>
                                            <p className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{result.subtitle}</p>
                                        </div>
                                        <div className={`opacity-0 ${isSelected ? 'opacity-100' : ''} transition-opacity`}>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500 space-y-2">
                            <Hash size={40} className="mx-auto text-slate-300 mb-2" />
                            <p className="font-bold">No results found for "{query}"</p>
                            <p className="text-sm">Try searching for an address, name, or asset ID.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold">↑↓</span>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold">↵</span>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold">esc</span>
                            <span>Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
