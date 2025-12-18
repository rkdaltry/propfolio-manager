import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../DataContext';
import { Tenant } from '../types';
import { Users, UserPlus, MapPin, Edit, RotateCcw, Archive, Trash2, Eye, EyeOff, X, Save, Search, Filter, Calendar } from 'lucide-react';

const TenantsPage: React.FC = () => {
    const { properties, updateProperty } = useData();
    const navigate = useNavigate();

    const [showArchived, setShowArchived] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTenant, setEditingTenant] = useState<(Tenant & { propertyId: string }) | null>(null);

    const handleArchiveTenant = (propertyId: string, tenantId: string) => {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
            const updatedTenants = property.tenants.map(t => t.id === tenantId ? { ...t, isArchived: !t.isArchived } : t);
            updateProperty({ ...property, tenants: updatedTenants });
        }
    };

    const handleDeleteTenant = (propertyId: string, tenantId: string) => {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
            const updatedTenants = property.tenants.map(t => t.id === tenantId ? { ...t, isDeleted: !t.isDeleted } : t);
            updateProperty({ ...property, tenants: updatedTenants });
        }
    };

    const handleSaveEditedTenant = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTenant) return;

        const property = properties.find(p => p.id === editingTenant.propertyId);
        if (property) {
            const updatedTenants = property.tenants.map(t => {
                if (t.id === editingTenant.id) {
                    const { propertyId, ...tenantData } = editingTenant;
                    return tenantData;
                }
                return t;
            });
            updateProperty({ ...property, tenants: updatedTenants });
        }
        setEditingTenant(null);
    };

    const isTenantVisible = (t: Tenant) => {
        if (t.name === 'Empty') return false;
        if (t.isDeleted && !showDeleted) return false;
        if (t.isArchived && !showArchived && !t.isDeleted) return false;
        if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    };

    const allTenants = properties.reduce((acc: Array<Tenant & { propertyAddress: string; propertyId: string }>, p) => {
        const tenants = p.tenants.map(t => ({ ...t, propertyAddress: p.address, propertyId: p.id }));
        return acc.concat(tenants);
    }, []).filter(isTenantVisible);

    return (
        <div className="p-8 lg:p-10 w-full mx-auto animate-fade-in pb-20">
            <div className="flex justify-end mb-8">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setShowDeleted(!showDeleted)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border flex items-center gap-2 whitespace-nowrap ${showDeleted ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-900/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{showDeleted ? <Eye size={16} /> : <EyeOff size={16} />}{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</button>
                    <button onClick={() => setShowArchived(!showArchived)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border flex items-center gap-2 whitespace-nowrap ${showArchived ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-900/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{showArchived ? <Eye size={16} /> : <EyeOff size={16} />}{showArchived ? 'Hide Archived' : 'Show Archived'}</button>
                    <button onClick={() => navigate('/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 whitespace-nowrap font-bold text-sm hover:scale-105 active:scale-95 transition-all"><UserPlus size={18} /><span className="hidden sm:inline">Add Tenant</span></button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-50"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                {/* Mobile View: Card Stack */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {allTenants.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Users size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-medium">No tenants found</p>
                        </div>
                    ) : allTenants.map(t => (
                        <div key={`${t.propertyId}_${t.id}`} onClick={() => navigate(`/properties/${t.propertyId}`)} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${t.isDeleted ? 'bg-red-50/30' : t.isArchived ? 'bg-slate-50/50' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${t.isDeleted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-bold text-lg leading-tight truncate ${t.isDeleted ? 'text-red-800 line-through' : 'text-slate-900 dark:text-slate-50'}`}>{t.name}</div>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {t.isDeleted && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase">Deleted</span>}
                                            {!t.isDeleted && t.isArchived && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase border border-slate-200 dark:border-slate-700">Archived</span>}
                                            <span className="flex items-center gap-1 text-[10px] items-center px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-md uppercase border border-blue-100 dark:border-blue-900/30">
                                                <MapPin size={10} /> {t.propertyAddress.split(',')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!t.isDeleted && (
                                        <button onClick={(e) => { e.stopPropagation(); setEditingTenant(t); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit size={18} /></button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTenant(t.propertyId, t.id); }} className={`p-2 rounded-lg transition-colors ${t.isDeleted ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>{t.isDeleted ? <RotateCcw size={18} /> : <Trash2 size={18} />}</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rent</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-50">£{t.rentAmount.toLocaleString()}/mo</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Balance</p>
                                    <span className={`text-[11px] font-bold block mt-0.5 ${(t.outstandingBalance || 0) > 0 ? 'text-red-600' : (t.outstandingBalance || 0) < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        {(t.outstandingBalance || 0) > 0 ? `£${t.outstandingBalance} Owed` : 'Paid'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="font-medium">{t.tenancyStartDate}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-medium">{t.tenancyEndDate}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4">Tenant Name</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Rent</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Contract Period</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {allTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        <Users size={48} className="mx-auto mb-3 text-slate-300" />
                                        <p className="font-medium">No tenants found</p>
                                    </td>
                                </tr>
                            ) : allTenants.map(t => (
                                <tr key={`${t.propertyId}_${t.id}`} onClick={() => navigate(`/properties/${t.propertyId}`)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${t.isDeleted ? 'bg-red-50/30' : t.isArchived ? 'bg-slate-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.isDeleted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${t.isDeleted ? 'text-red-800 line-through' : 'text-slate-900 dark:text-slate-50'}`}>{t.name}</div>
                                                <div className="flex gap-1 mt-0.5">
                                                    {t.isDeleted && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase">Deleted</span>}
                                                    {!t.isDeleted && t.isArchived && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase border border-slate-200 dark:border-slate-700">Archived</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                            <MapPin size={14} className="text-slate-400" />
                                            {t.propertyAddress.split(',')[0]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50 text-sm">£{t.rentAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${(t.outstandingBalance || 0) > 0 ? 'bg-red-100 text-red-700' : (t.outstandingBalance || 0) < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            {(t.outstandingBalance || 0) > 0 ? `£${t.outstandingBalance} Owed` : 'Paid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {t.tenancyStartDate} - {t.tenancyEndDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!t.isDeleted && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingTenant(t); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleArchiveTenant(t.propertyId, t.id); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={t.isArchived ? "Unarchive" : "Archive"}>{t.isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}</button>
                                                </>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTenant(t.propertyId, t.id); }} className={`p-2 rounded-lg transition-colors ${t.isDeleted ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`} title={t.isDeleted ? "Restore" : "Delete"}>{t.isDeleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Tenant Modal */}
            {editingTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Edit Tenant</h3>
                            <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEditedTenant} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Name</label>
                                <input required type="text" value={editingTenant.name} onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-50" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantsPage;
