import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyType } from '../types';
import { useData } from '../DataContext';
import { Plus, Edit, Trash2, Search, Filter, Building2, MapPin, MoreHorizontal, RefreshCcw, Archive } from 'lucide-react';
import { calculateCompletion, getComplianceStatus } from '../utils';

const PropertiesPage: React.FC = () => {
  const { properties, deleteProperty, restoreProperty, permanentlyDeleteProperty } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const handleDeleteProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (showArchived) {
      if (window.confirm('PERMANENT DELETE: Are you sure? This property and all its related data (tenants, documents, etc.) will be lost forever.')) {
        permanentlyDeleteProperty(id);
      }
    } else {
      if (window.confirm('Move to Bin? You can recover this property later from the Bin view.')) {
        deleteProperty(id);
      }
    }
  };

  const handleRestoreProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    restoreProperty(id);
  };

  const handleEditProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (showArchived) return; // Cannot edit archived properties directly
    navigate(`/properties/${id}?edit=general`);
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.postcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchiveStatus = showArchived ? p.isDeleted : !p.isDeleted;
    return matchesSearch && matchesArchiveStatus;
  });

  const archivedCount = properties.filter(p => p.isDeleted).length;

  return (
    <div className="p-8 lg:px-16 xl:px-24 lg:py-10 w-full mx-auto animate-fade-in pb-20">
      <div className="flex justify-end mb-8">
        <button
          onClick={() => navigate('/add')}
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 dark:shadow-blue-900/40 font-black text-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} /> Add Property
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800/80 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between transition-all duration-300">
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black transition-all uppercase tracking-widest border ${showArchived ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-lg ring-2 ring-amber-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Archive size={16} /> {showArchived ? 'View Portfolio' : `View Bin (${archivedCount})`}
          </button>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg transition-all uppercase tracking-widest">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden transition-all duration-300">
        {/* Mobile View: Card Stack */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredProperties.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-800" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {showArchived ? 'Your bin is empty' : 'No properties found'}
              </p>
            </div>
          ) : filteredProperties.map(property => {
            const completion = calculateCompletion(property);
            const compliance = getComplianceStatus(property);
            const liveTenants = property.tenants.filter(t => !t.isDeleted);
            const activeTenants = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived);
            const occupiedCount = activeTenants.length;
            const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
            const vacant = Math.max(0, propCapacity - occupiedCount);

            return (
              <div key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <img src={property.imageUrl} alt={property.address} className="w-24 h-24 object-cover rounded-[2rem] shadow-lg bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform" />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xl border-2 border-white dark:border-slate-900">
                      {completion}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 dark:text-white text-xl truncate tracking-tighter mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase italic">{property.address.split(',')[0]}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" /> {property.postcode}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${property.type === 'HMO' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'}`}>
                        {property.type}
                      </span>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${compliance.bg.replace('bg-', 'bg-').replace('-100', '-50 dark:bg-opacity-20')} border ${compliance.bg.replace('bg-', 'border-').replace('-100', '-100/50 dark:border-opacity-30')}`}>
                        <compliance.icon size={12} className={compliance.color} />
                        <span className={`text-[10px] font-black ${compliance.color} uppercase tracking-widest`}>{compliance.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Portfolio Health</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2">
                        {[...Array(propCapacity)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${i < occupiedCount ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{occupiedCount} / {propCapacity} Units</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showArchived ? (
                      <>
                        <button onClick={(e) => handleRestoreProperty(e, property.id)} className="p-3 bg-white dark:bg-slate-800 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-lg" title="Restore"><RefreshCcw size={18} /></button>
                        <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-3 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-lg" title="Permanently Delete"><Trash2 size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleEditProperty(e, property.id)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-lg"><Edit size={18} /></button>
                        <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 active:scale-90 hover:shadow-lg"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/40 backdrop-blur-md">
                <th className="px-8 py-5">Property Details</th>
                <th className="px-8 py-5 text-center">Class</th>
                <th className="px-8 py-5">Yield Structure</th>
                <th className="px-8 py-5">Onboarding State</th>
                <th className="px-8 py-5">Risk Matrix</th>
                <th className="px-8 py-5 text-right">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Building2 size={64} className="mx-auto mb-4 text-slate-100 dark:text-slate-800/50" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {showArchived ? 'Your bin is empty' : 'No assets detected'}
                    </p>
                  </td>
                </tr>
              ) : filteredProperties.map(property => {
                const completion = calculateCompletion(property);
                const compliance = getComplianceStatus(property);
                const liveTenants = property.tenants.filter(t => !t.isDeleted);
                const activeTenants = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived);
                const occupiedCount = activeTenants.length;
                const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
                const vacant = Math.max(0, propCapacity - occupiedCount);

                return (
                  <tr key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img src={property.imageUrl} alt={property.address} className="w-14 h-14 object-cover rounded-2xl shadow-lg border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{property.address.split(',')[0]}</div>
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 uppercase tracking-widest"><MapPin size={10} className="text-slate-300" /> {property.postcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${property.type === 'HMO' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${vacant > 0 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'}`}></div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{occupiedCount} / {propCapacity} Units</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(occupiedCount / propCapacity) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 w-56">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 tracking-tight">{completion}%</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Setup</span>
                        </div>
                        <div className="p-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-tighter shadow-sm border border-blue-100 dark:border-blue-900/50">Active</div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${completion}%` }}></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl ${compliance.bg.replace('bg-', 'bg-').replace('-100', '-50 dark:bg-opacity-20')} border ${compliance.bg.replace('bg-', 'border-').replace('-100', '-100/50 dark:border-opacity-30')} shadow-sm backdrop-blur-sm`}>
                        <compliance.icon size={14} className={compliance.color} />
                        <span className={`text-[10px] font-black ${compliance.color} uppercase tracking-widest`}>{compliance.label}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {showArchived ? (
                          <>
                            <button onClick={(e) => handleRestoreProperty(e, property.id)} className="p-2.5 bg-white dark:bg-slate-800 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-lg" title="Restore"><RefreshCcw size={16} /></button>
                            <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-2.5 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-lg" title="Permanently Delete"><Trash2 size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={(e) => handleEditProperty(e, property.id)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-lg" title="Edit"><Edit size={16} /></button>
                            <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 hover:shadow-lg" title="Delete"><Trash2 size={16} /></button>
                          </>
                        )}
                        <button className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;