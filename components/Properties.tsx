import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyType } from '../types';
import { useData } from '../DataContext';
import { Plus, Edit, Trash2, Search, Filter, Building2, MapPin, MoreHorizontal } from 'lucide-react';
import { calculateCompletion, getComplianceStatus } from '../utils';

const PropertiesPage: React.FC = () => {
  const { properties, deleteProperty } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deleteProperty(id);
    }
  };

  const handleEditProperty = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/properties/${id}?edit=general`);
  };

  const filteredProperties = properties.filter(p =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.postcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-10 w-full mx-auto animate-fade-in pb-20">
      <div className="flex justify-end mb-8">
        <button
          onClick={() => navigate('/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 font-bold text-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Property
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-50"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Mobile View: Card Stack */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No properties found</p>
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
              <div key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:scale-[0.99] transform">
                <div className="flex items-start gap-4 mb-3">
                  <img src={property.imageUrl} alt={property.address} className="w-16 h-16 object-cover rounded-xl shadow-sm bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-50 text-base truncate">{property.address.split(',')[0]}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1"><MapPin size={12} /> {property.postcode}</div>
                    <div className="mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${property.type === 'HMO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {property.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Occupancy</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${vacant > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{occupiedCount} / {propCapacity}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${compliance.bg} dark:bg-opacity-20`}>
                      <compliance.icon size={12} className={compliance.color} />
                      <span className={`text-[10px] font-bold ${compliance.color}`}>{compliance.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completion}%` }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{completion}%</span>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => handleEditProperty(e, property.id)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
              <tr className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Occupancy</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">Compliance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No properties found</p>
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
                  <tr key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={property.imageUrl} alt={property.address} className="w-12 h-12 object-cover rounded-lg shadow-sm bg-slate-200 dark:bg-slate-800" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-50 text-sm group-hover:text-blue-600 transition-colors">{property.address.split(',')[0]}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {property.postcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${property.type === 'HMO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${vacant > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{occupiedCount} / {propCapacity}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 pl-3.5">Units Occupied</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{completion}%</span>
                        <span className="text-[10px] text-slate-400">Setup</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${compliance.bg} dark:bg-opacity-20`}>
                        <compliance.icon size={14} className={compliance.color} />
                        <span className={`text-xs font-bold ${compliance.color}`}>{compliance.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEditProperty(e, property.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"><MoreHorizontal size={16} /></button>
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