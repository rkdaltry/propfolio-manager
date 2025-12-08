import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Document } from '../types';
import { Files, FileText, Upload, ExternalLink, X, Search, Filter } from 'lucide-react';
import { handleOpenDocument } from '../utils';

interface DocumentsPageProps {
  mode?: 'property' | 'tenant';
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ mode = 'property' }) => {
  const { properties, updateProperty } = useData();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<{ propertyId: string; category: string; name: string; expiryDate: string; fileUrl: string; fileType: string; }>({ propertyId: '', category: 'Compliance', name: '', expiryDate: '', fileUrl: '', fileType: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const title = mode === 'tenant' ? 'Tenant Documents' : 'Property Documents';
  const description = mode === 'tenant' ? 'Central repository for all tenant-related files.' : 'Central repository for all property-related files.';

  const allDocs = properties.reduce((acc: Array<Document & { propertyAddress: string; tenantName?: string }>, p) => {
    if (mode === 'tenant') {
      return acc.concat(p.tenants.flatMap(t => (t.documents || []).map(d => ({ ...d, propertyAddress: p.address, tenantName: t.name }))));
    } else {
      return acc.concat(p.documents.map(d => ({ ...d, propertyAddress: p.address })));
    }
  }, []).filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.tenantName && doc.tenantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    doc.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadData(prev => ({ ...prev, name: file.name, fileType: file.type.split('/')[1]?.toUpperCase() || 'FILE', fileUrl: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.propertyId || !uploadData.fileUrl) return;
    const newDoc: Document = { id: `doc_${Date.now()}`, name: uploadData.name, type: uploadData.fileType || 'FILE', uploadDate: new Date().toISOString(), url: uploadData.fileUrl, category: uploadData.category, expiryDate: uploadData.expiryDate || undefined };
    const property = properties.find(p => p.id === uploadData.propertyId);
    if (property) {
      updateProperty({ ...property, documents: [...property.documents, newDoc] });
    }
    setIsUploadModalOpen(false);
    setUploadData({ propertyId: '', category: 'Compliance', name: '', expiryDate: '', fileUrl: '', fileType: '' });
  };

  return (
    <div className="p-8 lg:p-10 w-full mx-auto animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {mode === 'tenant' ? <Files className="text-blue-600" size={32} /> : <FileText className="text-blue-600" size={32} />}
            {title}
          </h1>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
        {mode === 'property' && (
          <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 whitespace-nowrap font-bold text-sm">
            <Upload size={18} /> Upload Document
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${mode} documents...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {allDocs.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-dashed border-slate-300 text-center">
          {mode === 'tenant' ? <Files className="mx-auto text-slate-300 mb-4" size={64} /> : <FileText className="mx-auto text-slate-300 mb-4" size={64} />}
          <p className="text-slate-500 text-lg font-medium">No documents found.</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or upload a new document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {allDocs.map(doc => (
            <div key={doc.id} onClick={() => handleOpenDocument(doc)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {mode === 'tenant' ? <Files size={24} /> : <FileText size={24} />}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{doc.category}</div>
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">{doc.type}</div>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors" title={doc.name}>{doc.name}</h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                {doc.tenantName && <span className="font-semibold text-slate-700 mr-1">{doc.tenantName} •</span>}
                {doc.propertyAddress.split(',')[0]}
              </p>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 mt-auto">
                <div>
                  {doc.expiryDate && <span className={`block text-xs font-medium mb-0.5 ${new Date(doc.expiryDate) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>Exp: {new Date(doc.expiryDate).toLocaleDateString()}</span>}
                  <span className="text-xs opacity-80">Added: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                </div>
                {doc.url && (
                  <span className="text-blue-600 group-hover:underline flex items-center gap-1 font-bold text-xs bg-blue-50 px-2 py-1 rounded-lg group-hover:bg-blue-100 transition-colors">
                    View <ExternalLink size={12} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploadModalOpen && mode === 'property' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Upload Property Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDocument} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Property</label>
                <select required value={uploadData.propertyId} onChange={(e) => setUploadData({ ...uploadData, propertyId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                  <option value="">-- Select Property --</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                  {['Compliance', 'Insurance', 'Legal', 'Maintenance', 'Mortgage', 'Other'].map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">File</label>
                <div className="relative border border-slate-200 rounded-xl bg-slate-50 p-2">
                  <input type="file" required onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                  <Upload size={18} /> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
