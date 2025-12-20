import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../DataContext';
import { PropertyType, Property, Tenant } from '../types';
import { Building2, Users, ClipboardCheck, ArrowLeft, Plus, MapPin, PoundSterling, Calendar, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { DEMO_PROPERTIES } from '../constants';

type OnboardingState = 'hub' | 'property' | 'tenant' | 'success';

const OnboardingHub: React.FC = () => {
    const navigate = useNavigate();
    const { properties, addProperty, updateProperty } = useData();
    const [view, setView] = useState<OnboardingState>('hub');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [propData, setPropData] = useState({
        address: '',
        postcode: '',
        type: PropertyType.FLAT,
        capacity: 1
    });

    const [tenantData, setTenantData] = useState({
        propertyId: '',
        name: '',
        rentAmount: '',
        depositAmount: '',
        startDate: '',
        endDate: ''
    });

    const handleBack = () => {
        if (view === 'hub') navigate(-1);
        else setView('hub');
    };

    const handleSaveProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newProp: Property = {
            ...DEMO_PROPERTIES[0],
            id: `prop_${Date.now()}`,
            address: propData.address,
            postcode: propData.postcode,
            type: propData.type,
            capacity: Number(propData.capacity),
            tenants: [],
            documents: [],
            utilities: [],
            productInsurances: [],
            transactions: [],
            maintenanceTickets: [],
            imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
            purchaseDate: new Date().toISOString().split('T')[0],
        };

        // Reset complex objects for new property
        newProp.mortgage = undefined;
        newProp.buildingsInsurance = undefined;
        newProp.hmoLicence = undefined;
        newProp.gasCertificate = undefined;

        setTimeout(() => {
            addProperty(newProp);
            setIsLoading(false);
            setView('success');
        }, 800);
    };

    const handleSaveTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const property = properties.find(p => p.id === tenantData.propertyId);
        if (property) {
            const newTenant: Tenant = {
                id: `t_${Date.now()}`,
                name: tenantData.name,
                roomId: '',
                rentAmount: Number(tenantData.rentAmount),
                depositAmount: Number(tenantData.depositAmount),
                depositReference: '',
                tenancyStartDate: tenantData.startDate,
                tenancyEndDate: tenantData.endDate,
                outstandingBalance: 0,
                payments: [],
                documents: [],
                isArchived: false,
                isDeleted: false
            };

            setTimeout(() => {
                updateProperty({ ...property, tenants: [...property.tenants, newTenant] });
                setIsLoading(false);
                setView('success');
            }, 800);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] p-6 lg:px-16 xl:px-24 lg:py-10 w-full mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-2 text-sm font-medium group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                        {view === 'hub' && "What are we adding today?"}
                        {view === 'property' && "Add New Property"}
                        {view === 'tenant' && "Add New Tenant"}
                        {view === 'success' && "All Set!"}
                    </h1>
                </div>
            </div>

            {/* Hub Selection */}
            {view === 'hub' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setView('property')} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Building2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">New Property</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Register a new residential or HMO property to your portfolio. Quick and easy setup.</p>
                        <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                            Get Started <ChevronRight size={16} />
                        </div>
                    </button>

                    <button onClick={() => setView('tenant')} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">New Tenant</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Assign a tenant to an existing vacant property or HMO unit. Track rents and deposits.</p>
                        <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            Add Tenant <ChevronRight size={16} />
                        </div>
                    </button>

                    <div className="md:col-span-2 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-90 shadow-lg shadow-blue-500/20">
                        <button onClick={() => setView('property')} className="w-full group p-8 bg-white dark:bg-slate-900 rounded-[calc(1.5rem-1px)] hover:bg-transparent transition-all duration-500 text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-50 dark:bg-blue-900/50 rounded-md">Power Mode</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 group-hover:text-slate-900 dark:group-hover:text-white mb-2">Full Tenancy Setup</h3>
                                <p className="text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-200 text-sm leading-relaxed max-w-xl">Create a property and assign its first tenant in one single flow. Recommended for new acquisitions.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                                Launch Wizard <ChevronRight size={16} />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Property Form */}
            {view === 'property' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden glass-card">
                    <form onSubmit={handleSaveProperty} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Location Details</label>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <MapPin size={18} />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={propData.address}
                                                onChange={(e) => setPropData({ ...propData, address: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                placeholder="Street Address"
                                            />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={propData.postcode}
                                            onChange={(e) => setPropData({ ...propData, postcode: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Postcode"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Property Type & Capacity</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={propData.type}
                                            onChange={(e) => setPropData({ ...propData, type: e.target.value as PropertyType })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={PropertyType.FLAT}>Single Unit</option>
                                            <option value={PropertyType.HMO}>HMO</option>
                                        </select>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="1"
                                                value={propData.capacity}
                                                onChange={(e) => setPropData({ ...propData, capacity: Number(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                placeholder="Units"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Units</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">HMO properties will automatically include room management features once created.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : <><Save size={18} /> Create Property</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tenant Form */}
            {view === 'tenant' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden glass-card">
                    <form onSubmit={handleSaveTenant} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Assignment</label>
                                    <select
                                        required
                                        value={tenantData.propertyId}
                                        onChange={(e) => setTenantData({ ...tenantData, propertyId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Property</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Tenant Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Users size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={tenantData.name}
                                            onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Financials</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <PoundSterling size={18} />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                value={tenantData.rentAmount}
                                                onChange={(e) => setTenantData({ ...tenantData, rentAmount: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="Monthly Rent"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <PoundSterling size={18} />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                value={tenantData.depositAmount}
                                                onChange={(e) => setTenantData({ ...tenantData, depositAmount: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="Deposit"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Tenancy Dates</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <input
                                                required
                                                type="date"
                                                value={tenantData.startDate}
                                                onChange={(e) => setTenantData({ ...tenantData, startDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <input
                                                required
                                                type="date"
                                                value={tenantData.endDate}
                                                onChange={(e) => setTenantData({ ...tenantData, endDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : <><Save size={18} /> Add Tenant</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Success State */}
            {view === 'success' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-12 text-center animate-fade-in glass-card">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-3 tracking-tight">Success!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto">Your new record has been added to the portfolio. Ready for the next one?</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setView('hub')} className="w-full sm:w-auto bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">Add Another</button>
                        <button onClick={() => navigate('/properties')} className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">View Portfolio</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardingHub;
