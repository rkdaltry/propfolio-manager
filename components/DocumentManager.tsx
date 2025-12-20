import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Download,
    Filter,
    Plus,
    Search,
    File,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X
} from 'lucide-react';
import {
    uploadDocument,
    getDocumentsByEntity,
    deleteDocument,
    DocumentMetadata
} from '../services/firebaseService';

interface DocumentManagerProps {
    entityId: string;
    entityType: 'property' | 'tenant';
    className?: string;
}

const CATEGORIES = [
    'All',
    'Leases',
    'Safety Certificates',
    'Insurance',
    'Tenancy Documents',
    'Identity Docs',
    'Photos',
    'Miscellaneous'
];

const DocumentManager: React.FC<DocumentManagerProps> = ({ entityId, entityType, className = '' }) => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocuments();
    }, [entityId, entityType]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await getDocumentsByEntity(entityId, entityType);
            setDocuments(docs);
        } catch (error) {
            console.error("Error loading documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setShowUploadModal(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const newDoc = await uploadDocument(
                selectedFile,
                { entityId, entityType, category: selectedCategory },
                (progress) => setUploadProgress(progress)
            );

            setDocuments(prev => [newDoc, ...prev]);
            setShowUploadModal(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please check your connection and try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (doc: DocumentMetadata) => {
        if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

        try {
            await deleteDocument(doc);
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete document.");
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon size={20} />;
        if (type.includes('pdf')) return <FileText size={20} />;
        return <File size={20} />;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Document Manager</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage and categorize your files for this {entityType}.</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
                >
                    <Upload size={20} />
                    <span>Upload New</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search documents by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-50"
                    />
                </div>
            </div>

            {/* Document List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="font-medium">Fetching documents...</p>
                    </div>
                ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map(doc => (
                        <div
                            key={doc.id}
                            className="premium-card group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
                            onClick={() => window.open(doc.downloadURL, '_blank')}
                        >
                            <div className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <a
                                            href={doc.downloadURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                                            title="Download"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Download size={18} />
                                        </a>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-50 truncate mb-1" title={doc.name}>
                                        {doc.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                                            {doc.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>

                                {/* Click hint */}
                                <p className="text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Click to open →</p>
                            </div>

                            {/* Bottom Decoration */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                            <FileText size={40} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <p className="font-bold text-lg text-slate-500 dark:text-slate-400">No documents found</p>
                        <p className="text-sm">Click "Upload New" to get started.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Upload File</h3>
                            <button
                                onClick={() => !isUploading && setShowUploadModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                    {getFileIcon(selectedFile.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-slate-50 truncate text-sm">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${selectedCategory === cat
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-100 dark:hover:border-blue-900'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-blue-600">Uploading...</span>
                                        <span className="text-slate-500">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={isUploading}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    <span>{isUploading ? 'Uploading...' : 'Confirm'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
