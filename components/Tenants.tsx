
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Tenant } from '../types';
import { Users, Layers, UserPlus, MapPin, Edit, RotateCcw, Archive, Trash2, Eye, EyeOff, X, Save, Search, Filter, MoreHorizontal, Calendar, PoundSterling } from 'lucide-react';

const TenantsPage: React.FC = () => {
    const { properties, updateProperty } = useData();

    const [groupByProperty, setGroupByProperty] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTenant, setEditingTenant] = useState<(Tenant & { propertyId: string }) | null>(null);

    const [formData, setFormData] = useState({
        propertyId: '',
        name: '',
        roomId: '',
        rentAmount: '',
        depositAmount: '',
        startDate: '',
        endDate: ''
    });

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

    const handleSaveTenant = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.propertyId || !formData.name) return;

        const property = properties.find(p => p.id === formData.propertyId);
        if (property) {
            const newTenant: Tenant = {
                id: `t_${Date.now()}`,
                name: formData.name,
                roomId: formData.roomId,
                rentAmount: Number(formData.rentAmount),
                depositAmount: Number(formData.depositAmount),
                depositReference: '',
                tenancyStartDate: formData.startDate,
                tenancyEndDate: formData.endDate,
                outstandingBalance: 0,
                payments: [],
                documents: [],
                isArchived: false,
                isDeleted: false
            };
            updateProperty({ ...property, tenants: [...property.tenants, newTenant] });
        }
        setIsAddModalOpen(false);
        setFormData({ propertyId: '', name: '', roomId: '', rentAmount: '', depositAmount: '', startDate: '', endDate: '' });
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tenants</h1>
                    <p className="text-slate-500 mt-1">Directory of all active tenants across your portfolio.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setShowDeleted(!showDeleted)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border flex items-center gap-2 whitespace-nowrap ${showDeleted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{showDeleted ? <Eye size={16} /> : <EyeOff size={16} />}{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</button>
                    <button onClick={() => setShowArchived(!showArchived)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border flex items-center gap-2 whitespace-nowrap ${showArchived ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{showArchived ? <Eye size={16} /> : <EyeOff size={16} />}{showArchived ? 'Hide Archived' : 'Show Archived'}</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 whitespace-nowrap font-bold text-sm"><UserPlus size={18} /><span className="hidden sm:inline">Add Tenant</span></button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4">Tenant Name</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Rent</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4">Contract Period</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allTenants.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                                    <Users size={48} className="mx-auto mb-3 text-slate-300" />
                                    <p className="font-medium">No tenants found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or add a new tenant.</p>
                                </td></tr>
                            ) : allTenants.map(t => (
                                <tr key={`${t.propertyId}_${t.id}`} className={`hover:bg-slate-50 transition-colors group ${t.isDeleted ? 'bg-red-50/30' : t.isArchived ? 'bg-slate-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.isDeleted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${t.isDeleted ? 'text-red-800 line-through' : 'text-slate-900'}`}>{t.name}</div>
                                                <div className="flex gap-1 mt-0.5">
                                                    {t.isDeleted && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase">Deleted</span>}
                                                    {!t.isDeleted && t.isArchived && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">Archived</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <MapPin size={14} className="text-slate-400" />
                                            {t.propertyAddress.split(',')[0]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">£{t.rentAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${(t.outstandingBalance || 0) > 0 ? 'bg-red-100 text-red-700' : (t.outstandingBalance || 0) < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {(t.outstandingBalance || 0) > 0 ? `£${t.outstandingBalance} Owed` : 'Paid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {t.tenancyStartDate} - {t.tenancyEndDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!t.isDeleted && (
                                                <>
                                                    <button onClick={() => setEditingTenant(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={() => handleArchiveTenant(t.propertyId, t.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t.isArchived ? "Unarchive" : "Archive"}>{t.isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}</button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteTenant(t.propertyId, t.id)} className={`p-2 rounded-lg transition-colors ${t.isDeleted ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`} title={t.isDeleted ? "Restore" : "Delete"}>{t.isDeleted ? <RotateCcw size={16} /> : <Trash2 size={16} />}</button>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Edit Tenant</h3>
                            <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEditedTenant} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input required type="text" value={editingTenant.name} onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
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

            {/* Add Tenant Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Add New Tenant</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveTenant} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Property</label>
                                <select required value={formData.propertyId} onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                                    <option value="">-- Select --</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rent Amount</label>
                                    <div className="relative">
                                        <PoundSterling size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="number" value={formData.rentAmount} onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deposit</label>
                                    <div className="relative">
                                        <PoundSterling size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="number" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]">Save Tenant</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantsPage;
