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
        <div className="p-8 lg:px-16 xl:px-24 lg:py-10 w-full mx-auto animate-fade-in pb-20">
            {/* Header with Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tenants</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all tenants across your portfolio</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setShowDeleted(!showDeleted)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 whitespace-nowrap hover:shadow-md active:scale-95 ${showDeleted ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}`}>{showDeleted ? <Eye size={16} /> : <EyeOff size={16} />}{showDeleted ? 'Hide deleted' : 'Show deleted'}</button>
                    <button onClick={() => setShowArchived(!showArchived)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 whitespace-nowrap hover:shadow-md active:scale-95 ${showArchived ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}`}>{showArchived ? <Eye size={16} /> : <EyeOff size={16} />}{showArchived ? 'Hide archived' : 'Show archived'}</button>
                    <button onClick={() => navigate('/add')} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40 whitespace-nowrap font-semibold text-sm hover:scale-105 active:scale-95"><UserPlus size={18} /><span className="hidden sm:inline">Add Tenant</span></button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-300">
                <div className="relative w-full md:w-80 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all dark:text-white placeholder:text-slate-400"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Tenant List Container */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden transition-all duration-300">
                {/* Mobile View: Card Stack */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
                    {allTenants.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <Users size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                            <p className="text-sm font-medium text-slate-400">No tenants found</p>
                        </div>
                    ) : allTenants.map(t => (
                        <div key={`${t.propertyId}_${t.id}`} onClick={() => navigate(`/properties/${t.propertyId}?tab=tenants`)} className={`p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group ${t.isDeleted ? 'bg-red-50/10' : t.isArchived ? 'bg-slate-50/20' : ''}`}>
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg border-2 border-white dark:border-slate-800 ${t.isDeleted ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-semibold text-lg leading-tight truncate ${t.isDeleted ? 'text-red-400 line-through opacity-60' : 'text-slate-900 dark:text-white'}`}>{t.name}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {t.isDeleted && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg">Deleted</span>}
                                            {!t.isDeleted && t.isArchived && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-lg">Archived</span>}
                                            <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                                                <MapPin size={12} /> {t.propertyAddress.split(',')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!t.isDeleted && (
                                        <button onClick={(e) => { e.stopPropagation(); setEditingTenant(t); }} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-md"><Edit size={16} /></button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTenant(t.propertyId, t.id); }} className={`p-2.5 bg-white dark:bg-slate-800 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-md ${t.isDeleted ? 'text-emerald-500' : 'text-slate-400 hover:text-red-500'}`}>{t.isDeleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Monthly Rent</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">£{t.rentAmount.toLocaleString()}<span className="text-xs font-normal text-slate-400 ml-1">/mo</span></p>
                                </div>
                                <div className="bg-white/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Balance</p>
                                    <span className={`text-lg font-bold block ${(t.outstandingBalance || 0) > 0 ? 'text-red-500' : (t.outstandingBalance || 0) < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {(t.outstandingBalance || 0) > 0 ? `£${t.outstandingBalance}` : 'Settled'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <Calendar size={14} className="text-blue-500" />
                                <span>{t.tenancyStartDate}</span>
                                <span className="text-slate-300 dark:text-slate-700">→</span>
                                <span>{t.tenancyEndDate}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/40">
                                <th className="px-6 py-4">Tenant</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Rent</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Tenancy Period</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {allTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center">
                                        <Users size={56} className="mx-auto mb-4 text-slate-100 dark:text-slate-800/50" />
                                        <p className="text-sm font-medium text-slate-400">No tenants found</p>
                                    </td>
                                </tr>
                            ) : allTenants.map(t => (
                                <tr key={`${t.propertyId}_${t.id}`} onClick={() => navigate(`/properties/${t.propertyId}?tab=tenants&tenant=${t.id}`)} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group ${t.isDeleted ? 'bg-red-50/10' : t.isArchived ? 'bg-slate-50/20' : ''}`}>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shadow-md border border-white dark:border-slate-800 ${t.isDeleted ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`}>
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-semibold text-base ${t.isDeleted ? 'text-red-400 line-through' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}`}>{t.name}</div>
                                                <div className="flex gap-1.5 mt-1">
                                                    {t.isDeleted && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-md">Deleted</span>}
                                                    {!t.isDeleted && t.isArchived && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-md">Archived</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <MapPin size={14} className="text-slate-400 dark:text-slate-600" />
                                            {t.propertyAddress.split(',')[0]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-slate-900 dark:text-white text-base">£{t.rentAmount.toLocaleString()}</td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${(t.outstandingBalance || 0) > 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : (t.outstandingBalance || 0) < 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                            {(t.outstandingBalance || 0) > 0 ? `£${t.outstandingBalance} owed` : 'Settled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Calendar size={14} className="text-slate-400 dark:text-slate-600" />
                                            {t.tenancyStartDate} <span className="text-slate-300 dark:text-slate-700">→</span> {t.tenancyEndDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            {!t.isDeleted && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingTenant(t); }} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-md" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleArchiveTenant(t.propertyId, t.id); }} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-md" title={t.isArchived ? "Unarchive" : "Archive"}>{t.isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}</button>
                                                </>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTenant(t.propertyId, t.id); }} className={`p-2 bg-white dark:bg-slate-800 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-md ${t.isDeleted ? 'text-emerald-500' : 'text-slate-400 hover:text-red-500'}`} title={t.isDeleted ? "Restore" : "Delete"}>{t.isDeleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}</button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-6 animate-fade-in">
                    <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-200 dark:border-slate-800/80">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Tenant</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Update tenant information</p>
                            </div>
                            <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveEditedTenant} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</label>
                                <input required type="text" value={editingTenant.name} onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all dark:text-white" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
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

