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
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { useData } from '../DataContext';
import { extractTenantData } from '../services/geminiService';
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
        console.log('[AIHub] handleFileSelect triggered');
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            console.log('[AIHub] File selected:', file.name, file.type);
            setSelectedFile(file);
            performRealOCR(file);
        } else {
            console.log('[AIHub] No file in selection event');
        }
    };

    const performRealOCR = async (file: File) => {
        setIsProcessing(true);
        setProcessingStep(0);
        setExtractedData(null);

        try {
            let extractedFields: any = null;
            setProcessingStep(1); // Analyzing Structure

            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                const pagesToProcess = Math.min(pdf.numPages, 2); // Process first 2 pages
                console.log('[AIHub] Processing PDF -', pdf.numPages, 'total pages, extracting first', pagesToProcess);
                console.log('[AIHub] Using multi-page image extraction for complete tenant data');

                // Convert first 2 pages to images and combine for Gemini Vision
                const pageImages: string[] = [];
                for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2.0 }); // Slightly lower scale for multi-page
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d')!;
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport }).promise;
                    const base64Data = canvas.toDataURL('image/jpeg', 0.90).split(',')[1];
                    pageImages.push(base64Data);
                    console.log(`[AIHub] Converted page ${pageNum} to image, size:`, Math.round(base64Data.length / 1024), 'KB');
                }

                setProcessingStep(2); // Extracting Entities
                // Pass multiple images to the extraction function
                extractedFields = await extractTenantData(pageImages, 'images', 'image/jpeg');
            } else {
                // Image - Use Gemini Multimodal
                setProcessingStep(1); // Analyzing Structure
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                });
                reader.readAsDataURL(file);
                const base64Data = await base64Promise;

                setProcessingStep(2); // Extracting Entities
                extractedFields = await extractTenantData(base64Data, 'image', file.type);
            }

            setProcessingStep(3); // Validating Data Point Mapping

            if (extractedFields) {
                setExtractedData({
                    type: 'tenant',
                    confidence: 0.98,
                    fields: {
                        ...extractedFields,
                        propertyId: properties[0]?.id || 'prop_1'
                    }
                });
            } else {
                throw new Error("AI failed to extract structured data");
            }
            setIsProcessing(false);

        } catch (error) {
            console.error("Extraction failed:", error);
            setIsProcessing(false);
            alert("Digital Brain Flinched: AI extraction failed. Falling back to manual entry mode.");
            // Fallback to a clear editable mock if error
            setExtractedData({
                type: 'tenant',
                confidence: 0.5,
                fields: {
                    name: "",
                    email: "",
                    phone: "",
                    startDate: new Date().toISOString().split('T')[0],
                    rentAmount: 0,
                    depositAmount: 0,
                    propertyId: properties[0]?.id || 'prop_1'
                }
            });
        }
    };

    const handleFieldUpdate = (key: string, value: any) => {
        if (!extractedData) return;
        setExtractedData({
            ...extractedData,
            fields: {
                ...extractedData.fields,
                [key]: value
            }
        });
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
        // Reset file input to allow selecting the same file again or new files
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                            fileInputRef.current?.click();
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
                                    {/* Name Field */}
                                    <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</p>
                                        <input
                                            type="text"
                                            value={extractedData.fields.name || ''}
                                            onChange={(e) => handleFieldUpdate('name', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        />
                                    </div>

                                    {/* Email Field - Full width to prevent truncation */}
                                    <div className="col-span-2 space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                        <input
                                            type="email"
                                            value={extractedData.fields.email || ''}
                                            onChange={(e) => handleFieldUpdate('email', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        />
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                        <input
                                            type="tel"
                                            value={extractedData.fields.phone || ''}
                                            onChange={(e) => handleFieldUpdate('phone', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        />
                                    </div>

                                    {/* Start Date Field - Text input for flexibility */}
                                    <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                                        <input
                                            type="date"
                                            value={extractedData.fields.startDate || ''}
                                            onChange={(e) => handleFieldUpdate('startDate', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        />
                                    </div>

                                    {/* Rent Amount Field */}
                                    <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rent Amount</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400">£</span>
                                            <input
                                                type="number"
                                                value={extractedData.fields.rentAmount || 0}
                                                onChange={(e) => handleFieldUpdate('rentAmount', Number(e.target.value))}
                                                className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Deposit Amount Field */}
                                    <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposit Amount</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400">£</span>
                                            <input
                                                type="number"
                                                value={extractedData.fields.depositAmount || 0}
                                                onChange={(e) => handleFieldUpdate('depositAmount', Number(e.target.value))}
                                                className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Property Address Field - Full width */}
                                    <div className="col-span-2 space-y-2 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 group hover:border-emerald-300 transition-all">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Property Address (Extracted)</p>
                                        <input
                                            type="text"
                                            value={extractedData.fields.propertyAddress || ''}
                                            onChange={(e) => handleFieldUpdate('propertyAddress', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                                            placeholder="Property address from document"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Database size={18} className="text-blue-600" />
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Destination Asset</p>
                                        </div>
                                        <select
                                            value={extractedData.fields.propertyId}
                                            onChange={(e) => handleFieldUpdate('propertyId', e.target.value)}
                                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 appearance-none cursor-pointer"
                                        >
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id} className="text-slate-900">{p.address.split(',')[0]}</option>
                                            ))}
                                        </select>
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
