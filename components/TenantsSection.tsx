import React, { useState, useEffect, useRef } from 'react';
import { Property, Tenant, Payment } from '../types';
import { Users, Coins, AlertCircle, Mail, History, Sparkles, X, ChevronRight, UserPlus } from 'lucide-react';
import DocumentManager from './DocumentManager';

interface TenantsSectionProps {
    property: Property;
    onUpdateProperty: (property: Property) => void;
    onEditTenant: (tenant: Tenant) => void;
    onGenerateReminder: (tenant: Tenant) => Promise<string | null>;
    onAnalyzeLedger: (tenant: Tenant) => Promise<string | null>;
    onAddPayment: (tenant: Tenant, payment: Partial<Payment>) => void;
    initialSelectedTenantId?: string;
}

const TenantsSection: React.FC<TenantsSectionProps> = ({
    property,
    onUpdateProperty,
    onEditTenant,
    onGenerateReminder,
    onAnalyzeLedger,
    onAddPayment,
    initialSelectedTenantId
}) => {
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
        initialSelectedTenantId || (property.tenants.length > 0 ? property.tenants[0].id : null)
    );
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [generatedReminder, setGeneratedReminder] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [analyzingLedger, setAnalyzingLedger] = useState(false);
    const [ledgerAnalysis, setLedgerAnalysis] = useState<string | null>(null);
    const [isUploadTenantDocOpen, setIsUploadTenantDocOpen] = useState(false);
    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'Rent',
        reference: ''
    });
    const [newTenantDoc, setNewTenantDoc] = useState({
        name: '',
        category: 'Tenancy Agreement',
        summary: ''
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const tenantListRef = useRef<HTMLDivElement>(null);
    const highlightedTenantRef = useRef<HTMLButtonElement>(null);

    const activeTenant = property.tenants.find(t => t.id === selectedTenantId);

    // Auto-select and scroll to initial tenant if specified
    useEffect(() => {
        if (initialSelectedTenantId) {
            setSelectedTenantId(initialSelectedTenantId);
            // Scroll to the tenant in the list
            setTimeout(() => {
                highlightedTenantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [initialSelectedTenantId]);

    const handleGenerateReminder = async () => {
        if (!activeTenant) return;
        setLoadingAI(true);
        const reminder = await onGenerateReminder(activeTenant);
        setGeneratedReminder(reminder);
        setLoadingAI(false);
    };

    const handleAnalyzeLedger = async () => {
        if (!activeTenant) return;
        setAnalyzingLedger(true);
        const analysis = await onAnalyzeLedger(activeTenant);
        setLedgerAnalysis(analysis);
        setAnalyzingLedger(false);
    };

    const handleAddPayment = () => {
        if (!activeTenant || !newPayment.amount) return;
        onAddPayment(activeTenant, newPayment);
        setNewPayment({
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            type: 'Rent',
            reference: ''
        });
    };

    const handleSaveTenantDocument = (e: React.FormEvent) => {
        e.preventDefault();
        // This would normally call an onUpload prop, but for now we'll just close
        setIsUploadTenantDocOpen(false);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Users size={24} className="text-blue-600" />
                    Units & Tenants
                </h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {property.tenants.length} Active
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Tenant List */}
                <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/30">
                    <div className="p-4 space-y-2">
                        {property.tenants.map(tenant => (
                            <button
                                key={tenant.id}
                                ref={tenant.id === initialSelectedTenantId ? highlightedTenantRef : null}
                                onClick={() => setSelectedTenantId(tenant.id)}
                                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${selectedTenantId === tenant.id
                                    ? 'bg-white shadow-md ring-2 ring-blue-500'
                                    : tenant.id === initialSelectedTenantId
                                        ? 'bg-blue-50 ring-2 ring-blue-300 animate-pulse'
                                        : 'hover:bg-white/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-3 h-3 rounded-full shrink-0 ${tenant.outstandingBalance > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
                                    <div className="truncate">
                                        <p className={`font-bold truncate ${selectedTenantId === tenant.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {tenant.name}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">{tenant.roomId || 'Unit'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`text-slate-300 transition-transform group-hover:translate-x-0.5 ${selectedTenantId === tenant.id ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                        ))}
                        {property.tenants.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-slate-400 text-sm italic">No tenants added yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Tenant Detail */}
                <div className="lg:col-span-8 p-8">
                    {activeTenant ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-2 truncate max-w-md">{activeTenant.name}</h4>
                                    <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Coins size={16} className="text-emerald-500" /> £{activeTenant.rentAmount}/mo</span>
                                        <span className="flex items-center gap-1.5"><AlertCircle size={16} className={activeTenant.outstandingBalance > 0 ? 'text-red-500' : 'text-emerald-500'} /> Balance: £{activeTenant.outstandingBalance}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button
                                        onClick={() => onEditTenant(activeTenant)}
                                        className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm group"
                                        title="Edit Tenant"
                                    >
                                        <History size={20} className="text-slate-500 group-hover:text-blue-600" />
                                    </button>
                                    <button
                                        onClick={handleGenerateReminder}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        {loadingAI ? 'Generating...' : <><Mail size={18} /> AI Reminder</>}
                                    </button>
                                </div>
                            </div>

                            {/* Progress/Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Payment Health</p>
                                    <div className="flex items-end justify-between mb-2">
                                        <span className="text-2xl font-black text-slate-900">Good</span>
                                        <span className="text-sm font-bold text-emerald-600">No Arrears</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tenancy Status</p>
                                    <div className="flex items-end justify-between mb-2">
                                        <span className="text-2xl font-black text-slate-900">Active</span>
                                        <span className="text-sm font-bold text-blue-600">8 Months Left</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Reminder Display */}
                            {generatedReminder && (
                                <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-2xl animate-fade-in relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2">
                                        <button onClick={() => setGeneratedReminder(null)} className="p-1 hover:bg-blue-100 rounded-lg text-blue-400"><X size={18} /></button>
                                    </div>
                                    <h5 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                                        <Sparkles size={18} /> Generated Reminder
                                    </h5>
                                    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl text-sm text-slate-700 whitespace-pre-wrap font-medium border border-blue-100 mb-4 leading-relaxed">
                                        {generatedReminder}
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedReminder)}
                                        className="w-full py-3 bg-white text-blue-600 font-black rounded-xl border border-blue-200 hover:bg-blue-50 transition-all shadow-sm text-sm"
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>
                            )}

                            {/* Rent Ledger Preview */}
                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <h5 className="text-lg font-black text-slate-900">Rent Ledger</h5>
                                    <button
                                        onClick={() => setIsLedgerOpen(true)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                                    >
                                        Manage Ledger <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Reference</th>
                                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {activeTenant.payments.slice(0, 3).map(p => (
                                                <tr key={p.id} className="hover:bg-slate-100/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700">{p.date}</td>
                                                    <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[150px]">{p.reference || p.type}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`font-black text-base ${p.type === 'Charge' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            £{p.amount}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Documents Area integration */}
                            <div className="pt-6">
                                <DocumentManager
                                    entityId={activeTenant.id}
                                    entityType="tenant"
                                    className="bg-slate-50 border border-slate-100 p-8 rounded-2xl"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                <Users size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-400 mb-2">No Tenant Selected</h4>
                            <p className="text-slate-400 max-w-xs font-medium">Select a tenant from the list to view their details and manage their ledger.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Rent Ledger Modal */}
            {isLedgerOpen && activeTenant && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Rent Ledger: {activeTenant.name}</h3>
                                <p className="text-sm text-slate-500 font-bold">Current Balance: <span className={activeTenant.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>£{activeTenant.outstandingBalance}</span></p>
                            </div>
                            <button onClick={() => setIsLedgerOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={28} className="text-slate-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <h4 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest">Add Transaction</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                                    <div className="sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                                        <input type="date" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold bg-white" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                        <select className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold bg-white" value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value as any })}><option>Rent</option><option>Deposit</option><option>Charge</option><option>Adjustment</option></select>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (£)</label>
                                        <input type="number" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black bg-white" value={newPayment.amount || ''} onChange={e => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold bg-white" placeholder="Optional" value={newPayment.reference || ''} onChange={e => setNewPayment({ ...newPayment, reference: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <button onClick={handleAddPayment} className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                                        <tr><th className="px-8 py-5">Date</th><th className="px-8 py-5">Type</th><th className="px-8 py-5">Reference</th><th className="px-8 py-5 text-right">Amount</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeTenant.payments.length > 0 ? activeTenant.payments.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5 font-bold text-slate-700">{p.date}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.type === 'Rent' ? 'bg-emerald-100 text-emerald-700' : p.type === 'Charge' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{p.type}</span>
                                                </td>
                                                <td className="px-8 py-5 text-slate-500 font-medium font-mono text-[10px]">{p.reference || '-'}</td>
                                                <td className={`px-8 py-5 text-right font-black text-base ${p.type === 'Charge' ? 'text-red-600' : 'text-emerald-600'}`}>{p.type === 'Charge' ? '-' : '+'}£{p.amount}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No transactions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-500"><Sparkles size={32} /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-black text-indigo-900">AI Payment Insights</h4>
                                        <button
                                            onClick={handleAnalyzeLedger}
                                            disabled={analyzingLedger}
                                            className="text-xs font-black bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-white shadow-sm transition-all"
                                        >
                                            {analyzingLedger ? 'Analyzing...' : 'Refresh History'}
                                        </button>
                                    </div>
                                    <p className="text-indigo-800 text-sm leading-relaxed font-medium">
                                        {ledgerAnalysis || "Assessment pending. Please refresh history to generate insights."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Document Modal */}
            {isUploadTenantDocOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-900">Upload Document</h3>
                            <button onClick={() => setIsUploadTenantDocOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={28} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveTenantDocument} className="p-10 space-y-6">
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Document Name</label><input type="text" required className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 focus:border-blue-500" value={newTenantDoc.name} onChange={e => setNewTenantDoc({ ...newTenantDoc, name: e.target.value })} placeholder="e.g. Tenancy Agreement" /></div>
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label><select className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 focus:border-blue-500" value={newTenantDoc.category} onChange={e => setNewTenantDoc({ ...newTenantDoc, category: e.target.value })}><option value="Tenancy Agreement">Tenancy Agreement</option><option value="ID / Passport">ID / Passport</option><option value="Right to Rent">Right to Rent</option><option value="Guarantor">Guarantor</option><option value="Correspondence">Correspondence</option><option value="Other">Other</option></select></div>
                            <div className="pt-4"><button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">Upload Document</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantsSection;
