import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Building2, Users, Search, ChevronRight, FileText } from 'lucide-react';
import DocumentManager from './DocumentManager';

const DocumentsPage: React.FC = () => {
  const { properties } = useData();
  const [selectedType, setSelectedType] = useState<'property' | 'tenant' | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const propertiesList = properties.filter(p =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tenantsList = properties.flatMap(p =>
    p.tenants.filter(t => !t.isDeleted).map(t => ({
      ...t,
      propertyAddress: p.address
    }))
  ).filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEntity = (id: string, type: 'property' | 'tenant') => {
    setSelectedEntityId(id);
    setSelectedType(type);
  };

  const getSelectedName = () => {
    if (!selectedEntityId || !selectedType) return '';
    if (selectedType === 'property') {
      return properties.find(p => p.id === selectedEntityId)?.address || 'Property';
    } else {
      const tenant = properties.flatMap(p => p.tenants).find(t => t.id === selectedEntityId);
      return tenant?.name || 'Tenant';
    }
  };

  return (
    <div className="p-8 lg:px-16 xl:px-24 lg:py-10 w-full mx-auto animate-fade-in pb-20">
      {/* Header Area */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-2">Portfolio Documents</h1>
        <p className="text-slate-500 dark:text-slate-400">Access and manage all your property and tenant documentation in one place.</p>
      </div>

      {!selectedEntityId ? (
        <div className="space-y-10">
          {/* View Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedType(selectedType === 'property' ? null : 'property')}
              className={`premium-card p-8 text-left transition-all ${selectedType === 'property' ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Property Documents</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage leases, certificates, and insurance.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedType(selectedType === 'tenant' ? null : 'tenant')}
              className={`premium-card p-8 text-left transition-all ${selectedType === 'tenant' ? 'ring-2 ring-slate-800 bg-slate-50/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Tenant Documents</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">ID docs, references, and correspondence.</p>
                </div>
              </div>
            </button>
          </div>

          {/* Entity List */}
          {selectedType && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Select {selectedType === 'property' ? 'Property' : 'Tenant'}
                </h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={`Search ${selectedType}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedType === 'property' ? (
                  propertiesList.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectEntity(p.id, 'property')}
                      className="premium-card p-5 group flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                          <Building2 size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900 dark:text-slate-50 truncate w-40">{p.address.split(',')[0]}</p>
                          <p className="text-xs text-slate-500">{p.postcode}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                ) : (
                  tenantsList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectEntity(t.id, 'tenant')}
                      className="premium-card p-5 group flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                          <Users size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900 dark:text-slate-50 truncate w-40">{t.name}</p>
                          <p className="text-xs text-slate-500 truncate w-40">{t.propertyAddress.split(',')[0]}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {!selectedType && (
            <div className="py-20 flex flex-col items-center text-center opacity-40">
              <FileText size={80} className="mb-6 stroke-[1]" />
              <p className="text-xl font-medium">Select a category above to browse documents</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Breadcrumbs / Back button */}
          <div className="flex items-center gap-3 text-sm font-bold">
            <button
              onClick={() => { setSelectedEntityId(null); setSearchTerm(''); }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Documents
            </button>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-800 dark:text-slate-200">{getSelectedName()}</span>
          </div>

          {/* Integrated Document Manager */}
          <div className="premium-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 pt-6">
            <DocumentManager
              entityId={selectedEntityId}
              entityType={selectedType!}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
