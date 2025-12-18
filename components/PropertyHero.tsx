import React from 'react';
import { Property, PropertyType } from '../types';
import { MapPin, Building2, TrendingUp, Users, CheckCircle2, Edit, Trash2, Archive, ArrowLeft } from 'lucide-react';
import { calculateCompletion, getComplianceStatus } from '../utils';

interface PropertyHeroProps {
    property: Property;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const PropertyHero: React.FC<PropertyHeroProps> = ({ property, onBack, onEdit, onDelete }) => {
    const completion = calculateCompletion(property);
    const compliance = getComplianceStatus(property);

    // Calculate some vital stats
    const liveTenants = property.tenants.filter(t => !t.isDeleted);
    const activeTenants = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived);
    const occupiedCount = activeTenants.length;
    const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
    const occupancyRate = Math.round((occupiedCount / propCapacity) * 100);

    return (
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl group animate-fade-in">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={property.imageUrl}
                    alt={property.address}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 pt-20 lg:p-12 lg:pt-32 text-white">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all flex items-center gap-2 text-sm font-bold border border-white/10"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Top Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${property.type === PropertyType.HMO ? 'bg-purple-500/30 text-purple-100' : 'bg-blue-500/30 text-blue-100'}`}>
                        {property.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 bg-emerald-500/30 text-emerald-100`}>
                        {occupancyRate}% Occupied
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-1.5 ${compliance.bg.replace('bg-', 'bg-').replace('100', '500/30')} ${compliance.color.replace('text-', 'text-').replace('700', '100')}`}>
                        <compliance.icon size={12} /> {compliance.label}
                    </div>
                </div>

                {/* Title & Address */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
                            {property.address.split(',')[0]}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-300 text-lg font-medium">
                            <MapPin size={20} className="text-blue-400" />
                            {property.address}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onEdit}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 border border-blue-500"
                        >
                            <Edit size={18} /> Edit Property
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-100 rounded-xl transition-all backdrop-blur-md border border-red-500/30 active:scale-95"
                            title="Delete Property"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Yield</span>
                        <div className="flex items-center gap-2 text-2xl font-black text-emerald-400">
                            <TrendingUp size={24} /> 6.8%
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Occupancy</span>
                        <div className="flex items-center gap-2 text-2xl font-black text-blue-400">
                            <Users size={24} /> {occupiedCount}/{propCapacity}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Setup Status</span>
                        <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                                <span>{completion}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${completion}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance</span>
                        <div className="flex items-center gap-2 text-2xl font-black text-slate-200">
                            <CheckCircle2 size={24} className="text-emerald-500" /> Valid
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyHero;
