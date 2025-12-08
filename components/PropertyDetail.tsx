
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
    TrendingDown
} from 'lucide-react';
import { generatePaymentReminder, analyzePaymentHistory } from '../services/geminiService';
import { useSearchParams } from 'react-router-dom';
import { ComplianceItem, SectionCard, getExpiryStyle } from './PropertyDetailComponents';

interface PropertyDetailProps {
    property: Property;
    onBack: () => void;
    onUpdateProperty: (property: Property) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, onUpdateProperty }) => {
    // activeTab can be 'overview' or a tenantId
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [generatedReminder, setGeneratedReminder] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Query Params for direct edit linking
    const [searchParams] = useSearchParams();

    // Modal States
    const [activeEditSection, setActiveEditSection] = useState<string | null>(null);
    const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isUploadTenantDocOpen, setIsUploadTenantDocOpen] = useState(false);

    // Ledger Analysis State
    const [ledgerAnalysis, setLedgerAnalysis] = useState<string | null>(null);
    const [analyzingLedger, setAnalyzingLedger] = useState(false);

    // Tenant Document Upload State
    const [newTenantDoc, setNewTenantDoc] = useState<{
        name: string;
        category: string;
        fileUrl: string;
        fileType: string;
        summary: string;
    }>({
        name: '',
        category: 'Tenancy Agreement',
        fileUrl: '',
        fileType: '',
        summary: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null); // Ref for property image upload

    // Editing States
    const [editedProperty, setEditedProperty] = useState<Property>(property);
    const [editedTenant, setEditedTenant] = useState<Tenant | null>(null);

    // Helper state for adding new utility/product in modal
    const [newUtility, setNewUtility] = useState<Partial<UtilityProvider>>({ type: 'Electric', providerName: '', accountNumber: '' });
    const [newProduct, setNewProduct] = useState<Partial<ProductInsurance>>({ itemName: '', provider: '', renewalDate: '', premium: 0 });

    // Ledger Form State
    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'Rent',
        reference: ''
    });

    // Financial Stats Calculation
    const financialStats = useMemo(() => {
        let income = 0;
        let expense = 0;
        (property.transactions || []).forEach(tx => {
            if (tx.type === 'Income') income += Number(tx.amount);
            else expense += Number(tx.amount);
        });
        return { income, expense, profit: income - expense };
    }, [property.transactions]);

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
    }, [searchParams]);

    // Reset UI states when switching tabs
    useEffect(() => {
        setGeneratedReminder(null);
        setLedgerAnalysis(null);
    }, [activeTab]);

    const activeTenant = property.tenants.find(t => t.id === activeTab);

    // --- Handlers ---

    const handleSaveProperty = () => {
        onUpdateProperty(editedProperty);
        setActiveEditSection(null);
    };

    const handleOpenEditTenant = () => {
        if (activeTenant) {
            setEditedTenant({ ...activeTenant });
            setIsEditTenantOpen(true);
        }
    };

    const handleSaveTenant = () => {
        if (!editedTenant || !activeTenant) return;
        const updatedTenants = property.tenants.map(t => t.id === editedTenant.id ? editedTenant : t);
        onUpdateProperty({ ...property, tenants: updatedTenants });
        setIsEditTenantOpen(false);
    };

    const handleAddPayment = () => {
        if (!activeTenant || !newPayment.amount || !newPayment.date) return;

        const payment: Payment = {
            id: `pay_${Date.now()}`,
            date: newPayment.date,
            amount: Number(newPayment.amount),
            type: newPayment.type as 'Rent' | 'Deposit' | 'Charge' | 'Adjustment',
            reference: newPayment.reference,
            notes: newPayment.notes
        };

        // Update balance logic
        let newBalance = activeTenant.outstandingBalance;
        if (payment.type === 'Rent') {
            newBalance -= payment.amount;
        } else if (payment.type === 'Charge') {
            newBalance += payment.amount;
        } else if (payment.type === 'Adjustment' && payment.amount < 0) {
            newBalance += payment.amount; // Reduce debt
        }

        const updatedTenant = {
            ...activeTenant,
            outstandingBalance: newBalance,
            payments: [payment, ...activeTenant.payments]
        };

        const updatedTenants = property.tenants.map(t => t.id === activeTenant.id ? updatedTenant : t);
        onUpdateProperty({ ...property, tenants: updatedTenants });

        // Reset form
        setNewPayment({
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            type: 'Rent',
            reference: ''
        });
        setLedgerAnalysis(null);
    };

    const handleGenerateReminder = async () => {
        if (!activeTenant) return;
        setLoadingAI(true);
        const reminder = await generatePaymentReminder(
            activeTenant.name,
            activeTenant.outstandingBalance,
            property.address
        );
        setGeneratedReminder(reminder);
        setLoadingAI(false);
    };

    const handleAnalyzeLedger = async () => {
        if (!activeTenant) return;
        setAnalyzingLedger(true);
        try {
            const analysis = await analyzePaymentHistory(activeTenant.payments, activeTenant.rentAmount);
            setLedgerAnalysis(analysis || "Unable to generate analysis at this time.");
        } catch (e) {
            console.error(e);
            setLedgerAnalysis("Error analyzing payment history.");
        } finally {
            setAnalyzingLedger(false);
        }
    };

    // Handle new property image upload
    const handlePropertyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                onUpdateProperty({ ...property, imageUrl: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTenantFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewTenantDoc(prev => ({
                    ...prev,
                    name: file.name,
                    fileType: file.type.split('/')[1]?.toUpperCase() || 'FILE',
                    fileUrl: ev.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveTenantDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTenant || !newTenantDoc.fileUrl) return;

        const newDoc: Document = {
            id: `doc_${Date.now()}`,
            name: newTenantDoc.name,
            type: newTenantDoc.fileType,
            uploadDate: new Date().toISOString(),
            url: newTenantDoc.fileUrl,
            category: newTenantDoc.category,
            summary: newTenantDoc.summary
        };

        const updatedTenant = {
            ...activeTenant,
            documents: [...(activeTenant.documents || []), newDoc]
        };

        const updatedTenants = property.tenants.map(t => t.id === activeTenant.id ? updatedTenant : t);
        onUpdateProperty({ ...property, tenants: updatedTenants });

        setIsUploadTenantDocOpen(false);
        setNewTenantDoc({ name: '', category: 'Tenancy Agreement', fileUrl: '', fileType: '', summary: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenDocument = (doc: Document) => {
        if (!doc.url) return;
        if (doc.url.startsWith('data:')) {
            try {
                const arr = doc.url.split(',');
                const mimeMatch = arr[0].match(/:(.*?);/);
                const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                const blob = new Blob([u8arr], { type: mime });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (e) {
                console.error("Failed to open document", e);
                window.open(doc.url, '_blank');
            }
        } else {
            window.open(doc.url, '_blank');
        }
    };

    // --- Styles for consistency ---
    const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";
    const valueStyle = "text-lg font-semibold text-slate-900";
    const sectionHeaderStyle = "text-xl font-bold text-slate-800 flex items-center gap-2";

    // --- Helper Functions for Editing ---
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

    return (
        <div className="animate-fade-in space-y-8 w-full">
            {/* Main Header */}
            <div className="flex items-center gap-5 mb-2">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft size={28} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{property.address.split(',')[0]}</h1>
                    <div className="flex items-center gap-3 text-slate-500 text-base mt-1">
                        <span className="flex items-center gap-2"><MapPin size={18} /> {property.address}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${property.type === 'HMO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {property.type}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-5">
                    <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div className="p-3 space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-base font-medium ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Building2 size={20} />
                                Overview
                            </button>
                        </div>

                        <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex justify-between items-center">
                            <span>Units / Tenants</span>
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{property.tenants.filter(t => !t.isDeleted).length}</span>
                        </div>

                        <div className="p-3 space-y-1">
                            {property.tenants.filter(t => !t.isDeleted).map(tenant => (
                                <button
                                    key={tenant.id}
                                    onClick={() => setActiveTab(tenant.id)}
                                    className={`w-full text-left px-5 py-4 rounded-lg transition-all flex justify-between items-center group ${activeTab === tenant.id ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-2.5 h-2.5 rounded-full ${tenant.outstandingBalance > 0 ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
                                        <span className="truncate text-base font-medium">{tenant.name}</span>
                                    </div>
                                    {activeTab === tenant.id && <ArrowRight size={16} />}
                                </button>
                            ))}
                            {property.tenants.filter(t => !t.isDeleted).length === 0 && (
                                <div className="px-5 py-3 text-sm text-slate-400 italic">No tenants added.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    {activeTab === 'overview' ? (
                        <div className="space-y-8 animate-fade-in">

                            {/* Hero Image - Scaled with Edit Overlay */}
                            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
                                <img src={property.imageUrl} alt="Property" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-8 text-white max-w-3xl">
                                    <h2 className="text-3xl font-bold mb-2">{property.address}</h2>
                                    <div className="relative group/desc pr-10">
                                        <p className="opacity-90 text-lg leading-relaxed cursor-text" onClick={() => setActiveEditSection('general')}>
                                            {property.description || 'No description provided. Click to add.'}
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveEditSection('general'); }}
                                            className="absolute top-0 right-full mr-2 opacity-0 group-hover/desc:opacity-100 p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"
                                            title="Edit Description"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                                {/* Edit Image Button Overlay */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md px-4 py-2 rounded-lg font-medium text-sm border border-white/30 transition-colors"
                                    >
                                        <Camera size={18} /> Change Photo
                                    </button>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={handlePropertyImageChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Key Info */}
                                <SectionCard title="Key Information" icon={Info} onEdit={() => setActiveEditSection('general')}>
                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="flex items-center p-5 bg-slate-100 rounded-xl border border-slate-200">
                                            <div className="p-2.5 bg-white rounded-full shadow-sm text-blue-600 mr-4">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className={labelStyle}>Owner</p>
                                                <p className={valueStyle}>{property.owner || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="flex items-center p-5 bg-slate-100 rounded-xl border border-slate-200">
                                                <div className="p-2.5 bg-white rounded-full shadow-sm text-emerald-600 mr-4">
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <p className={labelStyle}>Purchased</p>
                                                    <p className={valueStyle}>{property.purchaseDate || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-5 bg-slate-100 rounded-xl border border-slate-200">
                                                <div className="p-2.5 bg-white rounded-full shadow-sm text-purple-600 mr-4">
                                                    <Home size={24} />
                                                </div>
                                                <div>
                                                    <p className={labelStyle}>Type</p>
                                                    <p className={valueStyle}>{property.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Financial Overview (New Card) */}
                                <SectionCard title="Financial Overview" icon={Wallet} onEdit={() => { }}>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={14} /> Income</p>
                                            <p className="text-2xl font-bold text-slate-900">£{financialStats.income.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown size={14} /> Expenses</p>
                                            <p className="text-2xl font-bold text-slate-900">£{financialStats.expense.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Net Profit</p>
                                            <p className={`text-2xl font-bold ${financialStats.profit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                                £{financialStats.profit.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {property.transactions && property.transactions.length > 0 ? (
                                        <div className="border-t border-slate-100 pt-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Recent Transactions</p>
                                            <div className="space-y-3">
                                                {property.transactions.slice(0, 3).map((tx, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'Income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                            <span className="text-slate-600 font-medium">{tx.description || tx.category}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</span>
                                                            <span className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {tx.type === 'Income' ? '+' : '-'}£{tx.amount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic text-center py-2">No transactions recorded yet.</p>
                                    )}
                                </SectionCard>

                                {/* Mortgage Details */}
                                <SectionCard title="Mortgage Details" icon={CreditCard} onEdit={() => setActiveEditSection('financials')}>
                                    <div className="space-y-6">
                                        {/* Payment & Lender */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className={labelStyle}>Monthly Payment</p>
                                                <div className="text-4xl font-bold text-slate-900 tracking-tight mt-1">£{property.mortgage?.monthlyPayment || 0}</div>
                                                <div className="flex items-center gap-2 text-base font-medium text-slate-600 mt-1">
                                                    <Building2 size={18} className="text-slate-400" /> {property.mortgage?.lenderName || 'No Lender'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 mb-2">
                                                    {property.mortgage?.type || 'Fixed Rate'}
                                                </span>
                                                <div className="flex items-center justify-end gap-1 text-slate-700 font-bold text-lg">
                                                    <Percent size={18} className="text-slate-400" />
                                                    {property.mortgage?.interestRate}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Term & Expiry */}
                                        <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-6">
                                            <div>
                                                <p className={labelStyle}>Term Length</p>
                                                <p className={valueStyle}>{property.mortgage?.termYears || 0} Years</p>
                                            </div>
                                            <div>
                                                <p className={labelStyle}>Rate Expiry</p>
                                                {(() => {
                                                    const style = getExpiryStyle(property.mortgage?.fixedRateExpiry);
                                                    return (
                                                        <div className={`inline-flex flex-col items-start p-2.5 rounded-lg border ${style.class} w-full`}>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-0.5">
                                                                <CalendarClock size={12} />
                                                                {style.status}
                                                            </div>
                                                            <div className="text-sm font-bold">
                                                                {property.mortgage?.fixedRateExpiry ? new Date(property.mortgage.fixedRateExpiry).toLocaleDateString() : 'N/A'}
                                                            </div>
                                                            {style.days !== null && (
                                                                <div className="text-[10px] opacity-80 mt-0.5">
                                                                    {style.days < 0 ? `${Math.abs(style.days)} days ago` : `${style.days} days left`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Council Tax & Ground Rent */}
                                <SectionCard title={property.type === PropertyType.FLAT ? "Council Tax & Ground Rent" : "Council Tax"} icon={Landmark} onEdit={() => setActiveEditSection('council')}>
                                    <div className="flex items-center justify-between bg-slate-100 p-5 rounded-xl border border-slate-200 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl shadow-sm">
                                                {property.councilTax?.band || '?'}
                                            </div>
                                            <p className="text-base font-bold text-slate-600">Band</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={labelStyle}>Annual Cost</p>
                                            <p className="text-2xl font-bold text-slate-900">£{property.councilTax?.annualCost || 0}</p>
                                        </div>
                                    </div>

                                    {property.type === PropertyType.FLAT && (
                                        <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-5">
                                            <div>
                                                <p className={labelStyle}>Ground Rent</p>
                                                <p className={valueStyle}>£{property.groundRent?.amount || 0} <span className="text-xs font-normal text-slate-500 lowercase">/ {property.groundRent?.period}</span></p>
                                            </div>
                                            <div>
                                                <p className={labelStyle}>Next Review</p>
                                                <p className={valueStyle}>{property.groundRent?.reviewDate || 'Not Set'}</p>
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>

                                {/* HMO Licence (Conditional) */}
                                {property.type === PropertyType.HMO && (
                                    <SectionCard title="HMO Licence" icon={FileBadge} onEdit={() => setActiveEditSection('hmo')}>
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                <span className="text-sm font-bold text-purple-900">Status</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${property.hmoLicence ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'}`}>
                                                    {property.hmoLicence ? 'Active' : 'Not Listed'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className={labelStyle}>Licence Number</p>
                                                    <p className="font-mono text-sm text-slate-700 font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">{property.hmoLicence?.licenceNumber || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className={labelStyle}>Renewal Date</p>
                                                    <p className={valueStyle}>{property.hmoLicence?.renewalDate || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>
                                )}

                                {/* Compliance */}
                                <SectionCard title="Compliance" icon={ShieldCheck} onEdit={() => setActiveEditSection('compliance')} className={property.type === PropertyType.HMO ? "" : "md:col-span-2"}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <ComplianceItem
                                            label="Gas Safety"
                                            date={property.gasCertificate?.expiryDate}
                                            status={property.gasCertificate?.status}
                                        />
                                        <ComplianceItem
                                            label="EICR"
                                            date={property.eicrCertificate?.expiryDate}
                                            status={property.eicrCertificate?.status}
                                        />
                                        <ComplianceItem
                                            label="EPC"
                                            date={property.epcCertificate?.expiryDate}
                                            status={property.epcCertificate?.status}
                                        />
                                    </div>
                                </SectionCard>

                                {/* Buildings Insurance - Separated */}
                                <SectionCard title="Buildings Insurance" icon={Shield} onEdit={() => setActiveEditSection('insurance')}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-5">
                                        <div>
                                            <p className={labelStyle}>Provider</p>
                                            <p className={valueStyle}>{property.buildingsInsurance?.provider || 'Not Set'}</p>
                                        </div>
                                        <div>
                                            <p className={labelStyle}>Policy Number</p>
                                            <p className="font-mono text-sm text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">{property.buildingsInsurance?.policyNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <p className={labelStyle}>Renewal Date</p>
                                            <p className={valueStyle}>{property.buildingsInsurance?.renewalDate || '-'}</p>
                                        </div>
                                        <div>
                                            <p className={labelStyle}>Annual Premium</p>
                                            <p className={valueStyle}>£{property.buildingsInsurance?.premium || 0}</p>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Utilities */}
                                <SectionCard title="Utilities" icon={Zap} onEdit={() => setActiveEditSection('utilities')}>
                                    <div className="space-y-3">
                                        {property.utilities.length > 0 ? property.utilities.map((util, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                                                        {util.type[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{util.type}</p>
                                                        <p className="text-sm font-semibold text-slate-800">{util.providerName}</p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{util.accountNumber}</span>
                                            </div>
                                        )) : <p className="text-slate-400 text-sm italic p-2">No utilities listed.</p>}
                                    </div>
                                </SectionCard>

                                {/* Product Insurance */}
                                <SectionCard title="Product Care" icon={Wrench} onEdit={() => setActiveEditSection('product_care')}>
                                    <div className="space-y-3">
                                        {property.productInsurances && property.productInsurances.length > 0 ? property.productInsurances.map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{p.itemName}</p><p className="text-xs text-slate-500">{p.provider} - £{p.premium}/yr</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-xs text-slate-400">Renews: {p.renewalDate}</div>
                                                    <button onClick={() => handleRemoveProduct(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        )) : <p className="text-slate-400 text-sm italic p-2">No product cover listed.</p>}
                                    </div>
                                </SectionCard>

                            </div>
                        </div>
                    ) : activeTenant ? (
                        <div className="space-y-6 animate-fade-in">
                            {/* Tenant Header */}
                            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900">{activeTenant.name}</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTenant.outstandingBalance > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {activeTenant.outstandingBalance > 0 ? 'Arrears' : 'Good Standing'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-5 text-base text-slate-500">
                                        <span className="flex items-center gap-1.5"><CalendarClock size={18} /> {activeTenant.tenancyStartDate} - {activeTenant.tenancyEndDate}</span>
                                        <span className="flex items-center gap-1.5"><Coins size={18} /> £{activeTenant.rentAmount}/mo</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleOpenEditTenant}
                                        className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Edit Tenant
                                    </button>

                                    {/* Deleted Button Removed */}

                                    <button
                                        onClick={handleGenerateReminder}
                                        className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                    >
                                        {loadingAI ? '...' : <Mail size={18} />} AI Reminder
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Stats similar to previous implementation */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rent Paid</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            £{activeTenant.payments.filter(p => p.type === 'Rent').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Coins size={24} /></div>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Balance</p>
                                        <p className={`text-2xl font-bold mt-1 ${activeTenant.outstandingBalance > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                            £{activeTenant.outstandingBalance.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`p-2.5 rounded-lg ${activeTenant.outstandingBalance > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                        <AlertCircle size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* AI Reminder Display */}
                            {generatedReminder && (
                                <div className="bg-slate-50 border-2 border-blue-100 rounded-xl p-6 shadow-md animate-fade-in relative overflow-hidden">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                                        <Mail size={20} className="text-blue-600" /> Draft Email
                                    </h4>
                                    <div className="bg-slate-100 p-5 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-mono border border-slate-200 mb-3">
                                        {generatedReminder}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setGeneratedReminder(null)} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5">Dismiss</button>
                                        <button onClick={() => navigator.clipboard.writeText(generatedReminder)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Copy</button>
                                    </div>
                                </div>
                            )}

                            {/* Ledger Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <h3 className="text-xl font-bold text-slate-900">Rent Ledger</h3>
                                <button
                                    onClick={() => setIsLedgerOpen(true)}
                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-200"
                                >
                                    <History size={18} /> Manage Ledger
                                </button>
                            </div>

                            {/* Payment History Table (Preview) */}
                            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Ref</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {activeTenant.payments.slice(0, 5).map(p => (
                                                <tr key={p.id} className="hover:bg-slate-100">
                                                    <td className="px-6 py-4 font-medium">{p.date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${p.type === 'Rent' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.type}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{p.reference || '-'}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-base">£{p.amount}</td>
                                                </tr>
                                            ))}
                                            {activeTenant.payments.length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No payments recorded.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {activeTenant.payments.length > 5 && (
                                        <div className="p-3 text-center border-t border-slate-100">
                                            <button onClick={() => setIsLedgerOpen(true)} className="text-xs text-blue-600 font-bold hover:underline">View All Payments</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="font-bold text-slate-900 text-xl">Documents</h3>
                                    <button
                                        onClick={() => setIsUploadTenantDocOpen(true)}
                                        className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Upload size={16} /> Upload
                                    </button>
                                </div>
                                {activeTenant.documents && activeTenant.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {activeTenant.documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                onClick={() => handleOpenDocument(doc)}
                                                title={doc.summary || doc.name}
                                                className={`flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all ${doc.url ? 'cursor-pointer hover:border-blue-300 group' : ''}`}
                                            >
                                                <div className={`p-2.5 rounded-lg mr-3 ${doc.url ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <div className={`text-base font-medium ${doc.url ? 'text-slate-700 group-hover:text-blue-700' : 'text-slate-500'}`}>{doc.name}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{doc.category}</div>
                                                </div>
                                                {doc.url && <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">No documents</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-lg">Select a tab</div>
                    )}
                </div>
            </div>

            {/* --- EDIT PROPERTY MODAL (SECTION BASED) --- */}
            {activeEditSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">
                                {activeEditSection === 'general' && 'Edit General Info'}
                                {activeEditSection === 'financials' && 'Edit Financials'}
                                {activeEditSection === 'council' && 'Edit Council Tax'}
                                {activeEditSection === 'hmo' && 'Edit HMO Licence'}
                                {activeEditSection === 'compliance' && 'Edit Compliance Docs'}
                                {activeEditSection === 'insurance' && 'Edit Buildings Insurance'}
                                {activeEditSection === 'utilities' && 'Manage Utilities'}
                                {activeEditSection === 'product_care' && 'Manage Product Care'}
                            </h3>
                            <button onClick={() => setActiveEditSection(null)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeEditSection === 'general' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                                        <input type="text" value={editedProperty.address} onChange={(e) => setEditedProperty({ ...editedProperty, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Postcode</label>
                                        <input type="text" value={editedProperty.postcode} onChange={(e) => setEditedProperty({ ...editedProperty, postcode: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner</label>
                                        <input type="text" value={editedProperty.owner || ''} onChange={(e) => setEditedProperty({ ...editedProperty, owner: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Date</label>
                                        <input type="date" value={editedProperty.purchaseDate} onChange={(e) => setEditedProperty({ ...editedProperty, purchaseDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                                        <select value={editedProperty.type} onChange={(e) => setEditedProperty({ ...editedProperty, type: e.target.value as PropertyType })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100">
                                            <option value={PropertyType.HMO}>HMO</option>
                                            <option value={PropertyType.FLAT}>Single Let / Flat</option>
                                        </select>
                                    </div>
                                    {/* NEW FIELD: Capacity/Units */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Capacity / Units</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editedProperty.capacity || 1}
                                            onChange={(e) => setEditedProperty({ ...editedProperty, capacity: Number(e.target.value) })}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                        <textarea value={editedProperty.description || ''} onChange={(e) => setEditedProperty({ ...editedProperty, description: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" rows={4} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            value={editedProperty.imageUrl || ''}
                                            onChange={(e) => setEditedProperty({ ...editedProperty, imageUrl: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">You can also upload an image directly from the property view.</p>
                                    </div>
                                </div>
                            )}

                            {/* ... other sections (Financials, Council, etc) preserved ... */}
                            {/* Ensure they are included in the final output */}
                            {activeEditSection === 'financials' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Payment</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.monthlyPayment || 0} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, fixedRateExpiry: '', interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), monthlyPayment: Number(e.target.value) } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Lender Name</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.lenderName || ''} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { monthlyPayment: 0, termYears: 0, fixedRateExpiry: '', interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), lenderName: e.target.value } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Interest Rate (%)</label><input type="number" step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.interestRate || 0} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, fixedRateExpiry: '', monthlyPayment: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), interestRate: Number(e.target.value) } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.type || 'Fixed'} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, fixedRateExpiry: '', monthlyPayment: 0, interestRate: 0, ...(editedProperty.mortgage || {}), type: e.target.value } })}><option value="Fixed">Fixed Rate</option><option value="Tracker">Tracker</option><option value="Variable">Standard Variable</option><option value="Interest Only">Interest Only</option></select></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Term Length (Years)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.termYears || 0} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', fixedRateExpiry: '', monthlyPayment: 0, interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), termYears: Number(e.target.value) } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Rate Expiry Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.mortgage?.fixedRateExpiry || ''} onChange={e => setEditedProperty({ ...editedProperty, mortgage: { lenderName: '', termYears: 0, monthlyPayment: 0, interestRate: 0, type: 'Fixed', ...(editedProperty.mortgage || {}), fixedRateExpiry: e.target.value } })} /></div>
                                </div>
                            )}

                            {activeEditSection === 'council' && (
                                <div className="space-y-6">
                                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Council Tax</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tax Band</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.councilTax?.band || ''} onChange={e => setEditedProperty({ ...editedProperty, councilTax: { annualCost: 0, ...(editedProperty.councilTax || {}), band: e.target.value } })} /></div>
                                        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Cost (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.councilTax?.annualCost || 0} onChange={e => setEditedProperty({ ...editedProperty, councilTax: { band: '', ...(editedProperty.councilTax || {}), annualCost: Number(e.target.value) } })} /></div>
                                    </div>
                                    {editedProperty.type === PropertyType.FLAT && (
                                        <>
                                            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">Ground Rent</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.groundRent?.amount || 0} onChange={e => setEditedProperty({ ...editedProperty, groundRent: { period: '', reviewDate: '', ...(editedProperty.groundRent || {}), amount: Number(e.target.value) } })} /></div>
                                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Period</label><input type="text" placeholder="e.g. Annually" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.groundRent?.period || ''} onChange={e => setEditedProperty({ ...editedProperty, groundRent: { amount: 0, reviewDate: '', ...(editedProperty.groundRent || {}), period: e.target.value } })} /></div>
                                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Review Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.groundRent?.reviewDate || ''} onChange={e => setEditedProperty({ ...editedProperty, groundRent: { amount: 0, period: '', ...(editedProperty.groundRent || {}), reviewDate: e.target.value } })} /></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeEditSection === 'hmo' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Licence Number</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.hmoLicence?.licenceNumber || ''} onChange={e => setEditedProperty({ ...editedProperty, hmoLicence: { renewalDate: '', ...(editedProperty.hmoLicence || {}), licenceNumber: e.target.value } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Renewal Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.hmoLicence?.renewalDate || ''} onChange={e => setEditedProperty({ ...editedProperty, hmoLicence: { licenceNumber: '', ...(editedProperty.hmoLicence || {}), renewalDate: e.target.value } })} /></div>
                                </div>
                            )}

                            {activeEditSection === 'compliance' && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="font-bold text-slate-700">Gas Safety</div>
                                        <div className="grid grid-cols-2 gap-2"><input type="date" className="text-sm border-slate-200 rounded" value={editedProperty.gasCertificate?.expiryDate || ''} onChange={e => setEditedProperty({ ...editedProperty, gasCertificate: { status: 'Pending', ...(editedProperty.gasCertificate || {}), expiryDate: e.target.value } })} /><select className="text-sm border-slate-200 rounded" value={editedProperty.gasCertificate?.status || 'Pending'} onChange={e => setEditedProperty({ ...editedProperty, gasCertificate: { expiryDate: '', ...(editedProperty.gasCertificate || {}), status: e.target.value as any } })}><option value="Valid">Valid</option><option value="Expired">Expired</option><option value="Pending">Pending</option></select></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="font-bold text-slate-700">EICR (Electric)</div>
                                        <div className="grid grid-cols-2 gap-2"><input type="date" className="text-sm border-slate-200 rounded" value={editedProperty.eicrCertificate?.expiryDate || ''} onChange={e => setEditedProperty({ ...editedProperty, eicrCertificate: { status: 'Pending', ...(editedProperty.eicrCertificate || {}), expiryDate: e.target.value } })} /><select className="text-sm border-slate-200 rounded" value={editedProperty.eicrCertificate?.status || 'Pending'} onChange={e => setEditedProperty({ ...editedProperty, eicrCertificate: { expiryDate: '', ...(editedProperty.eicrCertificate || {}), status: e.target.value as any } })}><option value="Valid">Valid</option><option value="Expired">Expired</option><option value="Pending">Pending</option></select></div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div className="font-bold text-slate-700">EPC (Energy)</div>
                                        <div className="grid grid-cols-2 gap-2"><input type="date" className="text-sm border-slate-200 rounded" value={editedProperty.epcCertificate?.expiryDate || ''} onChange={e => setEditedProperty({ ...editedProperty, epcCertificate: { status: 'Pending', ...(editedProperty.epcCertificate || {}), expiryDate: e.target.value } })} /><select className="text-sm border-slate-200 rounded" value={editedProperty.epcCertificate?.status || 'Pending'} onChange={e => setEditedProperty({ ...editedProperty, epcCertificate: { expiryDate: '', ...(editedProperty.epcCertificate || {}), status: e.target.value as any } })}><option value="Valid">Valid</option><option value="Expired">Expired</option><option value="Pending">Pending</option></select></div>
                                    </div>
                                </div>
                            )}

                            {activeEditSection === 'insurance' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.buildingsInsurance?.provider || ''} onChange={e => setEditedProperty({ ...editedProperty, buildingsInsurance: { policyNumber: '', renewalDate: '', premium: 0, ...(editedProperty.buildingsInsurance || {}), provider: e.target.value } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Policy Number</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.buildingsInsurance?.policyNumber || ''} onChange={e => setEditedProperty({ ...editedProperty, buildingsInsurance: { provider: '', renewalDate: '', premium: 0, ...(editedProperty.buildingsInsurance || {}), policyNumber: e.target.value } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Renewal Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.buildingsInsurance?.renewalDate || ''} onChange={e => setEditedProperty({ ...editedProperty, buildingsInsurance: { provider: '', policyNumber: '', premium: 0, ...(editedProperty.buildingsInsurance || {}), renewalDate: e.target.value } })} /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Premium (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedProperty.buildingsInsurance?.premium || 0} onChange={e => setEditedProperty({ ...editedProperty, buildingsInsurance: { provider: '', policyNumber: '', renewalDate: '', ...(editedProperty.buildingsInsurance || {}), premium: Number(e.target.value) } })} /></div>
                                </div>
                            )}

                            {activeEditSection === 'utilities' && (
                                <div className="space-y-6">
                                    {editedProperty.utilities.length > 0 && (
                                        <div className="space-y-2">
                                            {editedProperty.utilities.map((u, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-3"><div className="font-bold text-slate-700 w-20">{u.type}</div><div className="text-sm text-slate-600">{u.providerName}</div><div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">{u.accountNumber}</div></div>
                                                    <button onClick={() => handleRemoveUtility(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="p-5 bg-slate-100 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Add New Utility</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <select className="border-slate-200 rounded px-2 text-sm" value={newUtility.type} onChange={e => setNewUtility({ ...newUtility, type: e.target.value as any })}><option>Gas</option><option>Electric</option><option>Water</option><option>Internet</option></select>
                                            <input type="text" placeholder="Provider Name" className="border-slate-200 rounded px-2 text-sm" value={newUtility.providerName} onChange={e => setNewUtility({ ...newUtility, providerName: e.target.value })} />
                                            <input type="text" placeholder="Account Number" className="border-slate-200 rounded px-2 text-sm" value={newUtility.accountNumber} onChange={e => setNewUtility({ ...newUtility, accountNumber: e.target.value })} />
                                            <button onClick={handleAddUtility} className="bg-blue-600 text-white rounded font-bold text-sm py-2">Add</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeEditSection === 'product_care' && (
                                <div className="space-y-6">
                                    {editedProperty.productInsurances.length > 0 && (
                                        <div className="space-y-2">
                                            {editedProperty.productInsurances.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                                    <div><p className="text-sm font-bold text-slate-800">{p.itemName}</p><p className="text-xs text-slate-500">{p.provider} - £{p.premium}/yr</p></div>
                                                    <div className="flex items-center gap-4"><div className="text-xs text-slate-400">Renews: {p.renewalDate}</div><button onClick={() => handleRemoveProduct(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="p-5 bg-slate-100 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Add Product Care</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input type="text" placeholder="Item Name (e.g. Boiler)" className="border-slate-200 rounded px-2 py-2 text-sm" value={newProduct.itemName} onChange={e => setNewProduct({ ...newProduct, itemName: e.target.value })} />
                                            <input type="text" placeholder="Provider" className="border-slate-200 rounded px-2 py-2 text-sm" value={newProduct.provider} onChange={e => setNewProduct({ ...newProduct, provider: e.target.value })} />
                                            <input type="date" className="border-slate-200 rounded px-2 py-2 text-sm" value={newProduct.renewalDate} onChange={e => setNewProduct({ ...newProduct, renewalDate: e.target.value })} />
                                            <input type="number" placeholder="Premium (£)" className="border-slate-200 rounded px-2 py-2 text-sm" value={newProduct.premium || ''} onChange={e => setNewProduct({ ...newProduct, premium: Number(e.target.value) })} />
                                        </div>
                                        <button onClick={handleAddProduct} className="bg-blue-600 text-white rounded font-bold text-sm py-2 w-full mt-3">Add Policy</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setActiveEditSection(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:text-slate-800 text-base bg-white border border-slate-200 rounded-lg shadow-sm">Cancel</button>
                            <button onClick={handleSaveProperty} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm text-base">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT TENANT MODAL --- */}
            {isEditTenantOpen && editedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit Tenant</h3>
                            <button onClick={() => setIsEditTenantOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.name} onChange={(e) => setEditedTenant({ ...editedTenant, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Room ID</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.roomId || ''} onChange={(e) => setEditedTenant({ ...editedTenant, roomId: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-5">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Rent (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.rentAmount} onChange={(e) => setEditedTenant({ ...editedTenant, rentAmount: Number(e.target.value) })} /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Deposit (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.depositAmount} onChange={(e) => setEditedTenant({ ...editedTenant, depositAmount: Number(e.target.value) })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.tenancyStartDate} onChange={(e) => setEditedTenant({ ...editedTenant, tenancyStartDate: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={editedTenant.tenancyEndDate} onChange={(e) => setEditedTenant({ ...editedTenant, tenancyEndDate: e.target.value })} /></div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditTenantOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:text-slate-800 text-base bg-white border border-slate-200 rounded-lg shadow-sm">Cancel</button>
                            <button onClick={handleSaveTenant} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm text-base">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ... Ledger and Upload Modals preserved ... */}
            {isLedgerOpen && activeTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div><h3 className="text-xl font-bold text-slate-900">Rent Ledger: {activeTenant.name}</h3><p className="text-sm text-slate-500">Current Balance: <span className={activeTenant.outstandingBalance > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>£{activeTenant.outstandingBalance}</span></p></div>
                            <button onClick={() => setIsLedgerOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Add Transaction</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                                    <div className="sm:col-span-1"><label className="block text-xs font-bold text-slate-400 mb-1">Date</label><input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} /></div>
                                    <div className="sm:col-span-1"><label className="block text-xs font-bold text-slate-400 mb-1">Type</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value as any })}><option>Rent</option><option>Deposit</option><option>Charge</option><option>Adjustment</option></select></div>
                                    <div className="sm:col-span-1"><label className="block text-xs font-bold text-slate-400 mb-1">Amount (£)</label><input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newPayment.amount || ''} onChange={e => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} /></div>
                                    <div className="sm:col-span-1"><label className="block text-xs font-bold text-slate-400 mb-1">Reference</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Optional" value={newPayment.reference || ''} onChange={e => setNewPayment({ ...newPayment, reference: e.target.value })} /></div>
                                    <div className="sm:col-span-1"><button onClick={handleAddPayment} className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 text-sm">Add</button></div>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-500 font-bold text-xs uppercase border-b border-slate-200"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Reference</th><th className="px-6 py-4 text-right">Amount</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">{activeTenant.payments.length > 0 ? activeTenant.payments.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-700">{p.date}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.type === 'Rent' ? 'bg-emerald-100 text-emerald-700' : p.type === 'Charge' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{p.type}</span></td><td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.reference || '-'}</td><td className={`px-6 py-4 text-right font-bold text-base ${p.type === 'Charge' ? 'text-red-600' : 'text-emerald-600'}`}>{p.type === 'Charge' ? '-' : '+'}£{p.amount}</td></tr>)) : (<tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No transactions recorded.</td></tr>)}</tbody>
                                </table>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                <div className="flex justify-between items-center mb-3"><h4 className="font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={18} className="text-indigo-500" /> AI Payment Insights</h4><button onClick={handleAnalyzeLedger} disabled={analyzingLedger} className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">{analyzingLedger ? 'Analyzing...' : 'Analyze History'}</button></div>
                                <p className="text-indigo-800 text-sm leading-relaxed">{ledgerAnalysis || "Click 'Analyze History' to generate an assessment of this tenant's payment reliability."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isUploadTenantDocOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-md animate-fade-in flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-900">Upload Tenant Document</h3><button onClick={() => setIsUploadTenantDocOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button></div>
                        <form onSubmit={handleSaveTenantDocument} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Document Name</label><input type="text" required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={newTenantDoc.name} onChange={e => setNewTenantDoc({ ...newTenantDoc, name: e.target.value })} placeholder="e.g. Signed Tenancy Agreement" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" value={newTenantDoc.category} onChange={e => setNewTenantDoc({ ...newTenantDoc, category: e.target.value })}><option value="Tenancy Agreement">Tenancy Agreement</option><option value="ID / Passport">ID / Passport</option><option value="Right to Rent">Right to Rent</option><option value="Guarantor">Guarantor</option><option value="Correspondence">Correspondence</option><option value="Other">Other</option></select></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Summary / Notes (Optional)</label><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100" rows={3} value={newTenantDoc.summary} onChange={e => setNewTenantDoc({ ...newTenantDoc, summary: e.target.value })} placeholder="Brief description of the document..." /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">File</label><input type="file" required ref={fileInputRef} onChange={handleTenantFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" /></div>
                            <div className="pt-2"><button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 shadow-sm text-sm">Upload Document</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
