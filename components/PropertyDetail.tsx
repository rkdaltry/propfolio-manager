

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Property, Tenant, Payment, PropertyType, ProductInsurance, UtilityProvider, Document } from '../types';
import {
    ArrowLeft,
    MapPin,
    Users,
    Mail,
    Coins,
    AlertCircle,
    CalendarClock,
    ArrowRight,
    FileText,
    Download,
    Upload,
    Building2,
    CheckCircle2,
    Shield,
    Zap,
    CreditCard,
    Info,
    Edit,
    Plus,
    Trash2,
    Save,
    X,
    History,
    Home,
    Wrench,
    Landmark,
    FileBadge,
    ShieldCheck,
    AlertTriangle,
    Calendar,
    User,
    Percent,
    ExternalLink,
    Sparkles,
    Camera,
    Wallet,
    TrendingUp,
    TrendingDown,
    LayoutDashboard,
    ShieldAlert
} from 'lucide-react';
import { generatePaymentReminder, analyzePaymentHistory } from '../services/geminiService';
import { useSearchParams } from 'react-router-dom';
import { SectionCard } from './PropertyDetailComponents';
import DocumentManager from './DocumentManager';

// New Modular Components
import PropertyHero from './PropertyHero';
import TenantsSection from './TenantsSection';
import FinancialsSection from './FinancialsSection';
import ComplianceSection from './ComplianceSection';
import MaintenanceSection from './MaintenanceSection';
import YieldAnalysis from './YieldAnalysis';

interface PropertyDetailProps {
    property: Property;
    onBack: () => void;
    onUpdateProperty: (property: Property) => void;
    onDeleteProperty: (id: string) => void;
    onRestoreProperty: (id: string) => void;
    onPermanentDeleteProperty: (id: string) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
    property,
    onBack,
    onUpdateProperty,
    onDeleteProperty,
    onRestoreProperty,
    onPermanentDeleteProperty
}) => {
    const [viewMode, setViewMode] = useState<'dashboard' | 'tenants' | 'financials' | 'compliance' | 'maintenance' | 'yield'>('dashboard');
    const [searchParams] = useSearchParams();

    // Modal States
    const [activeEditSection, setActiveEditSection] = useState<string | null>(null);
    const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);

    // Editing States
    const [editedProperty, setEditedProperty] = useState<Property>(property);
    const [editedTenant, setEditedTenant] = useState<Tenant | null>(null);

    // Helper state for adding new utility/product in modal
    const [newUtility, setNewUtility] = useState<Partial<UtilityProvider>>({ type: 'Electric', providerName: '', accountNumber: '' });
    const [newProduct, setNewProduct] = useState<Partial<ProductInsurance>>({ itemName: '', provider: '', renewalDate: '', premium: 0 });

    // Sync editedProperty when prop changes
    useEffect(() => {
        setEditedProperty(property);
    }, [property]);

    // Check for edit query param
    useEffect(() => {
        const editParam = searchParams.get('edit');
        if (editParam === 'general') {
            setActiveEditSection('general');
        }

        // Check for tab query param (from Tenants page navigation)
        const tabParam = searchParams.get('tab');
        if (tabParam === 'tenants') {
            setViewMode('tenants');
        } else if (tabParam === 'compliance') {
            setViewMode('compliance');
        } else if (tabParam === 'financials') {
            setViewMode('financials');
        } else if (tabParam === 'maintenance') {
            setViewMode('maintenance');
        } else if (tabParam === 'yield') {
            setViewMode('yield');
        }
    }, [searchParams]);

    // --- Handlers ---

    const handleSaveProperty = () => {
        onUpdateProperty(editedProperty);
        setActiveEditSection(null);
    };

    const handleSaveTenant = () => {
        if (!editedTenant) return;
        const updatedTenants = property.tenants.map(t => t.id === editedTenant.id ? editedTenant : t);
        onUpdateProperty({ ...property, tenants: updatedTenants });
        setIsEditTenantOpen(false);
    };

    const handleAddPayment = (tenant: Tenant, paymentData: Partial<Payment>) => {
        const payment: Payment = {
            id: `pay_${Date.now()}`,
            date: paymentData.date || new Date().toISOString().split('T')[0],
            amount: Number(paymentData.amount),
            type: paymentData.type as any || 'Rent',
            reference: paymentData.reference,
            notes: paymentData.notes
        };

        let newBalance = tenant.outstandingBalance;
        if (payment.type === 'Rent') newBalance -= payment.amount;
        else if (payment.type === 'Charge') newBalance += payment.amount;
        else if (payment.type === 'Adjustment' && payment.amount < 0) newBalance += payment.amount;

        const updatedTenant = {
            ...tenant,
            outstandingBalance: newBalance,
            payments: [payment, ...(tenant.payments || [])]
        };

        const updatedTenants = property.tenants.map(t => t.id === tenant.id ? updatedTenant : t);
        onUpdateProperty({ ...property, tenants: updatedTenants });
    };

    const handleGenerateReminder = async (tenant: Tenant) => {
        return await generatePaymentReminder(tenant.name, tenant.outstandingBalance, property.address);
    };

    const handleAnalyzeLedger = async (tenant: Tenant) => {
        try {
            return await analyzePaymentHistory(tenant.payments, tenant.rentAmount);
        } catch (e) {
            console.error(e);
            return "Error analyzing payment history.";
        }
    };

    const handleAddUtility = () => {
        if (!newUtility.providerName) return;
        setEditedProperty({
            ...editedProperty,
            utilities: [...(editedProperty.utilities || []), newUtility as UtilityProvider]
        });
        setNewUtility({ type: 'Electric', providerName: '', accountNumber: '' });
    };

    const handleRemoveUtility = (index: number) => {
        const updated = [...(editedProperty.utilities || [])];
        updated.splice(index, 1);
        setEditedProperty({ ...editedProperty, utilities: updated });
    };

    const handleAddProduct = () => {
        if (!newProduct.itemName) return;
        const item: ProductInsurance = {
            id: `pi_${Date.now()}`,
            itemName: newProduct.itemName!,
            provider: newProduct.provider || '',
            renewalDate: newProduct.renewalDate || '',
            premium: Number(newProduct.premium || 0)
        };
        setEditedProperty({
            ...editedProperty,
            productInsurances: [...(editedProperty.productInsurances || []), item]
        });
        setNewProduct({ itemName: '', provider: '', renewalDate: '', premium: 0 });
    };

    const handleRemoveProduct = (index: number) => {
        const updated = [...(editedProperty.productInsurances || [])];
        updated.splice(index, 1);
        setEditedProperty({ ...editedProperty, productInsurances: updated });
    };

    const handleDelete = () => {
        if (property.isDeleted) {
            if (window.confirm('PERMANENT DELETE: This cannot be undone. Are you sure?')) {
                onPermanentDeleteProperty(property.id);
            }
        } else {
            if (window.confirm('Move to Bin? You can restore it later.')) {
                onDeleteProperty(property.id);
            }
        }
    };

    const handleRestore = () => {
        onRestoreProperty(property.id);
    };

    return (
        <div className="pb-20 animate-fade-in max-w-7xl mx-auto px-4 lg:px-8">
            {/* Soft-Delete Warning Banner */}
            {property.isDeleted && (
                <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md animate-pulse-subtle">
                    <div className="flex items-center gap-5">
                        <div className="bg-amber-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                            <Archive size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-amber-900 dark:text-amber-400 uppercase italic tracking-tight">This asset is in the Bin</h3>
                            <p className="text-sm font-bold text-amber-800/60 dark:text-amber-400/60">It was moved to the bin on {new Date(property.deletedAt || '').toLocaleDateString()}. Data is still safe but hidden from your main portfolio.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleRestore}
                            className="flex-1 md:flex-none px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={18} /> Restore Asset
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 md:flex-none px-8 py-3.5 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 border-2 border-red-500/20 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Delete Forever
                        </button>
                    </div>
                </div>
            )}

            {/* Modular Hero Section */}
            <PropertyHero
                property={property}
                onBack={onBack}
                onEdit={() => !property.isDeleted && setActiveEditSection('general')}
                onDelete={handleDelete}
            />

            {/* Dashboard Navigation Tabs */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                <button
                    onClick={() => setViewMode('dashboard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                    onClick={() => setViewMode('tenants')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'tenants' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <Users size={18} /> Tenants & Units
                </button>
                <button
                    onClick={() => setViewMode('compliance')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'compliance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <ShieldCheck size={18} /> Compliance
                </button>
                <button
                    onClick={() => setViewMode('financials')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'financials' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <Wallet size={18} /> Financials
                </button>
                <button
                    onClick={() => setViewMode('maintenance')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'maintenance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <Wrench size={18} /> Maintenance
                </button>
                <button
                    onClick={() => setViewMode('yield')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${viewMode === 'yield' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <TrendingUp size={18} /> Yield Analysis
                </button>
            </div>

            {/* Active Content View */}
            <div className="min-h-[500px]">
                {viewMode === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Compact Financial Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SectionCard title="Quick Overview" icon={Info} onEdit={() => setActiveEditSection('general')}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-500">Owner</span>
                                        <span className="font-black text-slate-900">{property.owner || 'Not Set'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-500">Purchase Date</span>
                                        <span className="font-black text-slate-900">{property.purchaseDate || 'N/A'}</span>
                                    </div>
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 mt-2">
                                        <p className="text-sm text-slate-600 italic leading-relaxed font-medium">
                                            {property.description || 'No property description provided yet.'}
                                        </p>
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <ShieldAlert size={24} className="text-red-500" />
                                    Critical Alerts
                                </h3>
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                    <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                                    <p className="font-bold text-slate-800">All Systems Normal</p>
                                    <p className="text-xs text-slate-400 font-medium max-w-[200px] mt-1">No urgent compliance or maintenance issues detected.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'tenants' && (
                    <TenantsSection
                        property={property}
                        onUpdateProperty={onUpdateProperty}
                        onEditTenant={(t) => {
                            setEditedTenant({ ...t });
                            setIsEditTenantOpen(true);
                        }}
                        onGenerateReminder={handleGenerateReminder}
                        onAnalyzeLedger={handleAnalyzeLedger}
                        onAddPayment={handleAddPayment}
                        initialSelectedTenantId={searchParams.get('tenant') || undefined}
                    />
                )}

                {viewMode === 'compliance' && (
                    <ComplianceSection
                        property={property}
                        onEditSection={setActiveEditSection}
                        onRemoveProduct={handleRemoveProduct}
                    />
                )}

                {viewMode === 'financials' && (
                    <FinancialsSection
                        property={property}
                        onEditSection={setActiveEditSection}
                    />
                )}

                {viewMode === 'maintenance' && (
                    <MaintenanceSection
                        property={property}
                        onUpdateProperty={onUpdateProperty}
                    />
                )}

                {viewMode === 'yield' && (
                    <YieldAnalysis
                        property={property}
                    />
                )}
            </div>

            {/* General Edit Modal */}
            {activeEditSection && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-900">
                                {activeEditSection === 'general' && 'General Information'}
                                {activeEditSection === 'financials' && 'Financial Details'}
                                {activeEditSection === 'council' && 'Local Taxes'}
                                {activeEditSection === 'hmo' && 'HMO Licensing'}
                                {activeEditSection === 'compliance' && 'Compliance Management'}
                                {activeEditSection === 'insurance' && 'Property Insurance'}
                                {activeEditSection === 'utilities' && 'Service Providers'}
                                {activeEditSection === 'product_care' && 'Maintenance Cover'}
                            </h3>
                            <button onClick={() => setActiveEditSection(null)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={28} className="text-slate-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            {activeEditSection === 'general' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                                        <input type="text" value={editedProperty.address} onChange={(e) => setEditedProperty({ ...editedProperty, address: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Postcode</label>
                                        <input type="text" value={editedProperty.postcode} onChange={(e) => setEditedProperty({ ...editedProperty, postcode: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Owner Name</label>
                                        <input type="text" value={editedProperty.owner || ''} onChange={(e) => setEditedProperty({ ...editedProperty, owner: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Purchase Date</label>
                                        <input type="date" value={editedProperty.purchaseDate} onChange={(e) => setEditedProperty({ ...editedProperty, purchaseDate: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Property Type</label>
                                        <select value={editedProperty.type} onChange={(e) => setEditedProperty({ ...editedProperty, type: e.target.value as PropertyType })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all">
                                            <option value={PropertyType.HMO}>HMO Portfolio</option>
                                            <option value={PropertyType.FLAT}>Single Residential</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Valuation (£)</label>
                                        <input type="number" value={editedProperty.currentValuation || ''} onChange={(e) => setEditedProperty({ ...editedProperty, currentValuation: Number(e.target.value) })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description / Notes</label>
                                        <textarea value={editedProperty.description || ''} onChange={(e) => setEditedProperty({ ...editedProperty, description: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" rows={4} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Latitude</label>
                                        <input type="number" step="0.0001" value={editedProperty.coordinates?.lat || ''} onChange={(e) => setEditedProperty({ ...editedProperty, coordinates: { ...(editedProperty.coordinates || { lng: 0 }), lat: Number(e.target.value) } })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" placeholder="e.g. 51.5074" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Longitude</label>
                                        <input type="number" step="0.0001" value={editedProperty.coordinates?.lng || ''} onChange={(e) => setEditedProperty({ ...editedProperty, coordinates: { ...(editedProperty.coordinates || { lat: 0 }), lng: Number(e.target.value) } })} className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all" placeholder="e.g. -0.1278" />
                                    </div>
                                </div>
                            )}

                            {activeEditSection === 'financials' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Mortgage Payment (£)</label>
                                        <input type="number" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-black bg-slate-50 outline-none focus:border-blue-500" value={editedProperty.mortgage?.monthlyPayment || 0} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, fixedRateExpiry: '', interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), monthlyPayment: Number(e.target.value) } })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Lender</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500" value={editedProperty.mortgage?.lenderName || ''} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { monthlyPayment: 0, termYears: 0, fixedRateExpiry: '', interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), lenderName: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                                        <input type="number" step="0.01" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500" value={editedProperty.mortgage?.interestRate || 0} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, fixedRateExpiry: '', monthlyPayment: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), interestRate: Number(e.target.value) } })} />
                                    </div>
                                </div>
                            )}

                            {/* Forms for compliance/insurance etc would go here, kept brief for now */}
                            {(activeEditSection === 'compliance' || activeEditSection === 'insurance' || activeEditSection === 'utilities' || activeEditSection === 'product_care') && (
                                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="font-bold text-slate-500">Form implementation in progress.</p>
                                    <p className="text-sm text-slate-400">Section: {activeEditSection}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                            <button onClick={() => setActiveEditSection(null)} className="px-8 py-4 text-slate-600 font-black hover:text-slate-800 transition-all">Cancel</button>
                            <button onClick={handleSaveProperty} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Tenant Modal */}
            {isEditTenantOpen && editedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-900">Modify Tenant</h3>
                            <button onClick={() => setIsEditTenantOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={28} className="text-slate-400" /></button>
                        </div>
                        <div className="p-10 space-y-6 flex-1 overflow-y-auto">
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tenant Name</label><input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500" value={editedTenant.name} onChange={(e) => setEditedTenant({ ...editedTenant, name: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Rent (£)</label><input type="number" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-black bg-slate-50 outline-none focus:border-blue-500" value={editedTenant.rentAmount} onChange={(e) => setEditedTenant({ ...editedTenant, rentAmount: Number(e.target.value) })} /></div>
                                <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deposit (£)</label><input type="number" className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-black bg-slate-50 outline-none focus:border-blue-500" value={editedTenant.depositAmount} onChange={(e) => setEditedTenant({ ...editedTenant, depositAmount: Number(e.target.value) })} /></div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                            <button onClick={() => setIsEditTenantOpen(false)} className="px-8 py-4 text-slate-600 font-black hover:text-slate-800 transition-all">Cancel</button>
                            <button onClick={handleSaveTenant} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
