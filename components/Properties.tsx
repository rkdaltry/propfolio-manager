import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyType } from '../types';
import { useData } from '../DataContext';
import { Plus, Edit, Trash2, ChevronRight, Search, Filter, Building2, MapPin, MoreHorizontal, X } from 'lucide-react';
import { calculateCompletion, getComplianceStatus } from '../utils';
import { MOCK_PROPERTIES } from '../constants';

const PropertiesPage: React.FC = () => {
  const { properties, addProperty, deleteProperty } = useData();
  const navigate = useNavigate();
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPropData, setNewPropData] = useState({
    address: '',
    postcode: '',
    type: PropertyType.FLAT,
    capacity: 1
  });

  const handleSaveNewProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropData.address) return;

    const newProp: Property = {
      ...MOCK_PROPERTIES[0],
      id: `prop_${Date.now()}`,
      address: newPropData.address,
      postcode: newPropData.postcode,
      type: newPropData.type,
      capacity: Number(newPropData.capacity),
      tenants: [],
      documents: [],
      utilities: [],
      productInsurances: [],
      transactions: [],
      purchaseDate: new Date().toISOString().split('T')[0],
      imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
      description: ''
    };
    // Reset complex objects
    newProp.mortgage = undefined;
    newProp.buildingsInsurance = undefined;
    newProp.hmoLicence = undefined;
    newProp.gasCertificate = undefined;

    addProperty(newProp);
    setIsAddPropModalOpen(false);
    setNewPropData({ address: '', postcode: '', type: PropertyType.FLAT, capacity: 1 });
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Properties</h1>
          <p className="text-slate-500 mt-1">Manage your portfolio assets and view performance.</p>
        </div>
        <button onClick={() => setIsAddPropModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 font-bold text-sm">
          <Plus size={18} /> Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Occupancy</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">Compliance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                  <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No properties found</p>
                  <p className="text-sm mt-1">Try adjusting your search or add a new property.</p>
                </td></tr>
              ) : filteredProperties.map(property => {
                const completion = calculateCompletion(property);
                const compliance = getComplianceStatus(property);

                const liveTenants = property.tenants.filter(t => !t.isDeleted);
                const activeTenants = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived);
                const occupiedCount = activeTenants.length;
                const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
                const vacant = Math.max(0, propCapacity - occupiedCount);

                return (
                  <tr key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={property.imageUrl} alt={property.address} className="w-12 h-12 object-cover rounded-lg shadow-sm bg-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{property.address.split(',')[0]}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {property.postcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${property.type === 'HMO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${vacant > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className="text-sm font-bold text-slate-700">{occupiedCount} / {propCapacity}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 pl-3.5">Units Occupied</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">{completion}%</span>
                        <span className="text-[10px] text-slate-400">Setup</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${compliance.bg}`}>
                        <compliance.icon size={14} className={compliance.color} />
                        <span className={`text-xs font-bold ${compliance.color}`}>{compliance.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEditProperty(e, property.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={(e) => handleDeleteProperty(e, property.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddPropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Add New Property</h3>
              <button onClick={() => setIsAddPropModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveNewProperty} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                <input required type="text" value={newPropData.address} onChange={(e) => setNewPropData({ ...newPropData, address: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 10 Downing Street" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Postcode</label>
                <input required type="text" value={newPropData.postcode} onChange={(e) => setNewPropData({ ...newPropData, postcode: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. SW1A 2AA" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                  <select value={newPropData.type} onChange={(e) => setNewPropData({ ...newPropData, type: e.target.value as PropertyType })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                    <option value={PropertyType.FLAT}>Flat / Single</option>
                    <option value={PropertyType.HMO}>HMO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Units</label>
                  <input type="number" min="1" value={newPropData.capacity} onChange={(e) => setNewPropData({ ...newPropData, capacity: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]">Add Property</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;