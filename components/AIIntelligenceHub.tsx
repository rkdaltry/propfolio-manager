import React, { useState, useRef } from 'react';
import {
    Cpu,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Zap,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Database,
    Search
} from 'lucide-react';
import { useData } from '../DataContext';
import { Property, Tenant } from '../types';

interface ExtractedData {
    type: 'property' | 'tenant';
    confidence: number;
    fields: Record<string, any>;
}

const AIIntelligenceHub: React.FC = () => {
    const { addProperty, properties, updateProperty } = useData();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const steps = [
        "Analyzing Document Structure...",
        "Extracting Natural Language Entities...",
        "Validating Fiscal Data Points...",
        "Finalizing Digital Twin Mapping..."
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            simulateOCR();
        }
    };

    const simulateOCR = () => {
        setIsProcessing(true);
        setProcessingStep(0);
        setExtractedData(null);

        // Step through simulation
        const interval = setInterval(() => {
            setProcessingStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(interval);
                    finishExtraction();
                    return prev;
                }
                return prev + 1;
            });
        }, 1500);
    };

    const finishExtraction = () => {
        // Mock extracted data based on a "Tenancy Agreement"
        const mockResult: ExtractedData = {
            type: 'tenant',
            confidence: 0.98,
            fields: {
                name: "Alexander Sterling",
                email: "a.sterling@example.com",
                phone: "+44 7700 900456",
                startDate: "2024-03-01",
                rentAmount: 2450,
                depositAmount: 3675,
                propertyId: properties[0]?.id || 'mock-id'
            }
        };

        setExtractedData(mockResult);
        setIsProcessing(false);
    };

    const handleSync = () => {
        if (!extractedData) return;

        if (extractedData.type === 'tenant') {
            const property = properties.find(p => p.id === extractedData.fields.propertyId);
            if (property) {
                const newTenant: Tenant = {
                    id: `t-${Date.now()}`,
                    name: extractedData.fields.name,
                    email: extractedData.fields.email,
                    phone: extractedData.fields.phone,
                    tenancyStartDate: extractedData.fields.startDate,
                    tenancyEndDate: "2025-03-01", // Default/Calculated
                    rentAmount: extractedData.fields.rentAmount,
                    depositAmount: extractedData.fields.depositAmount,
                    depositReference: "EXTRACTED-AI",
                    outstandingBalance: 0,
                    payments: [],
                    isDeleted: false
                };

                const updatedProperty = {
                    ...property,
                    tenants: [...property.tenants, newTenant]
                };
                updateProperty(updatedProperty);
                alert("Intelligence Synced: Tenant data has been integrated into the portfolio.");
                reset();
            }
        }
    };

    const reset = () => {
        setExtractedData(null);
        setSelectedFile(null);
        setIsProcessing(false);
    };

    return (
        <div className="max-w-5xl mx-auto p-10 animate-fade-in pb-32">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter italic uppercase">AI Intelligence Hub</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Institutional-grade document ingestion and OCR extraction.</p>
                </div>

                {!extractedData && !isProcessing && (
                    <button
                        onClick={() => {
                            // Demo Mode: Trigger simulation directly
                            // In a real app, this would open file dialog
                            simulateOCR();
                        }}
                        className="flex items-center gap-3 px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all transform active:scale-95 group"
                    >
                        <Upload size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                        <span>Run AI Ingestion</span>
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    {!extractedData && !isProcessing ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="premium-card min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all group relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/20"
                        >
                            <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl mb-8 group-hover:scale-110 transition-transform relative z-10">
                                <Cpu size={64} className="text-blue-600 animate-pulse-slow" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 relative z-10">Drop Portfolio Documents</h2>
                            <p className="text-slate-500 text-center max-w-sm font-medium relative z-10">Select Tenancy Agreements, Certificates, or Utility Bills for instant AI extraction.</p>
                        </div>
                    ) : isProcessing ? (
                        <div className="premium-card p-12 min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden bg-slate-900">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            </div>

                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                                </div>
                                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-blue-500 animate-[spin_3s_linear_infinite]"></div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <h3 className="text-2xl font-black text-white tracking-widest uppercase italic animate-pulse">Neural Processing</h3>
                                <div className="flex flex-col gap-2">
                                    {steps.map((step, i) => (
                                        <div key={i} className={`flex items-center gap-3 text-sm font-bold transition-all duration-500 ${i === processingStep ? 'text-blue-400 translate-x-2' : i < processingStep ? 'text-emerald-500 opacity-50' : 'text-slate-600'}`}>
                                            {i < processingStep ? <CheckCircle2 size={16} /> : <div className={`w-1.5 h-1.5 rounded-full ${i === processingStep ? 'bg-blue-400 animate-ping' : 'bg-slate-700'}`} />}
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000"
                                    style={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <div className="premium-card p-10 bg-white dark:bg-slate-900 border-2 border-emerald-500/30">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Extraction Verified</h3>
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className="text-amber-500 fill-amber-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score: {(extractedData.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={reset} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    {Object.entries(extractedData.fields).map(([key, value]) => (
                                        <div key={key} className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{typeof value === 'number' ? `£${value.toLocaleString()}` : value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Database size={18} className="text-blue-600" />
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Destination Asset</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {properties.find(p => p.id === extractedData.fields.propertyId)?.address || "Unassigned Asset"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSync}
                                        className="h-full px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 transition-all transform hover:translate-x-2 active:scale-95 flex items-center gap-4"
                                    >
                                        <span>Sync Intelligence</span>
                                        <ArrowRight size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="premium-card p-8 bg-slate-900 text-white space-y-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-lg font-black uppercase tracking-tighter italic border-b border-white/10 pb-4">AI Capabilities</h3>
                        <ul className="space-y-4">
                            {[
                                { title: "Auto-Field Recognition", icon: Search },
                                { title: "Fraud Detection Check", icon: ShieldCheck },
                                { title: "Portfolio Data Sync", icon: Database },
                                { title: "Multi-Format Support", icon: FileText }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 group">
                                    <div className="p-2 bg-white/5 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <item.icon size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="premium-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic mb-4">Bulk Process</h3>
                        <p className="text-white/80 text-sm font-medium mb-6">Uploading multiple lease agreements? Contact support for institutional API access.</p>
                        <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-50 transition-all">Request Access</button>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex gap-4">
                        <AlertCircle size={24} className="shrink-0" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Human-in-the-loop</p>
                            <p className="text-[11px] font-bold leading-relaxed">AI extractions should be verified by the asset manager before final synchronization.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIIntelligenceHub;
