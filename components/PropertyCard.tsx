import React from 'react';
import { Property, PropertyType } from '../types';
import { MapPin, Users, Home, ArrowRight, AlertTriangle, Edit, Trash2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onEdit, onDelete }) => {
  const occupiedRooms = property.tenants.filter(t => t.rentAmount > 0).length;
  const totalRooms = property.tenants.length;
  
  // Calculate total monthly rent
  const totalRent = property.tenants.reduce((acc, t) => acc + t.rentAmount, 0);

  // Determine alerts (simple logic)
  const hasAlerts = !property.hmoLicence && property.type === PropertyType.HMO; 

  return (
    <div 
      onClick={onClick}
      className="bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative flex flex-col"
    >
      <div className="relative h-80 overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.address} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Top Left: Type Badge & Alerts */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md backdrop-blur-sm ${
            property.type === PropertyType.HMO 
              ? 'bg-purple-100/90 text-purple-700' 
              : 'bg-blue-100/90 text-blue-700'
          }`}>
            {property.type}
          </span>
          
          {hasAlerts && (
             <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-md bg-red-100/90 text-red-700 flex items-center gap-1.5 backdrop-blur-sm">
               <AlertTriangle size={14} /> Action Needed
             </span>
          )}
        </div>

        {/* Top Right: Actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(e); }}
              className="p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 rounded-full shadow-md backdrop-blur-sm transition-colors"
              title="Edit Property"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-red-600 rounded-full shadow-md backdrop-blur-sm transition-colors"
              title="Delete Property"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900 text-xl leading-tight truncate pr-4">
                {property.address.split(',')[0]}
            </h3>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-base border border-emerald-100">
                £{totalRent}
            </span>
        </div>
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={16} className="mr-1.5" />
          {property.address.split(',').slice(1).join(',')}
        </div>
        
        {/* Added Description Preview */}
        <p className="text-slate-500 text-sm mb-5 line-clamp-2 h-10 leading-relaxed">
            {property.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-100 p-2.5 rounded-lg">
            <Users size={18} className="mr-2 text-blue-500" />
            <span>{occupiedRooms}/{totalRooms} Tenants</span>
          </div>
           <div className="flex items-center text-sm font-medium text-slate-700 bg-slate-100 p-2.5 rounded-lg">
            <Home size={18} className="mr-2 text-blue-500" />
            <span>{property.tenants.length} Units</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center mt-auto">
           <span className="text-xs text-slate-400 font-medium">Purchased: {new Date(property.purchaseDate).getFullYear()}</span>
           <span className="text-blue-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
             View Details <ArrowRight size={16} className="ml-1.5" />
           </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;