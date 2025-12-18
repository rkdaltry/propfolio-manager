import React from 'react';
import { Property, PropertyType } from '../types';
import { ShieldCheck, Shield, Zap, Wrench, AlertTriangle, FileBadge, CheckCircle2, ChevronRight, Trash2 } from 'lucide-react';
import { ComplianceItem, SectionCard } from './PropertyDetailComponents';

interface ComplianceSectionProps {
    property: Property;
    onEditSection: (section: string) => void;
    onRemoveProduct: (index: number) => void;
}

const ComplianceSection: React.FC<ComplianceSectionProps> = ({ property, onEditSection, onRemoveProduct }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Safety Certs Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <ShieldCheck size={24} className="text-emerald-600" />
                        Safety & Compliance
                    </h3>
                    <button
                        onClick={() => onEditSection('compliance')}
                        className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                    >
                        Update All
                    </button>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ComplianceItem
                            label="Gas Safety"
                            date={property.gasCertificate?.expiryDate}
                            status={property.gasCertificate?.status}
                        />
                        <ComplianceItem
                            label="EICR Certificate"
                            date={property.eicrCertificate?.expiryDate}
                            status={property.eicrCertificate?.status}
                        />
                        <ComplianceItem
                            label="EPC Rating"
                            date={property.epcCertificate?.expiryDate}
                            status={property.epcCertificate?.status}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* HMO Licence (Conditional) */}
                {property.type === PropertyType.HMO && (
                    <div className="bg-white rounded-3xl border border-purple-200 shadow-lg shadow-purple-50 overflow-hidden group">
                        <div className="p-8 border-b border-purple-50 flex justify-between items-center bg-purple-50/50">
                            <h4 className="text-lg font-black text-purple-900 flex items-center gap-3">
                                <FileBadge size={20} className="text-purple-600" />
                                HMO Licence
                            </h4>
                            <button
                                onClick={() => onEditSection('hmo')}
                                className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-xl transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Licence Number</p>
                                    <p className="font-mono text-sm font-bold text-purple-900 bg-purple-100/50 px-3 py-1.5 rounded-lg border border-purple-200 inline-block">
                                        {property.hmoLicence?.licenceNumber || 'NOT LISTED'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Renews</p>
                                    <p className="text-lg font-black text-purple-900">{property.hmoLicence?.renewalDate || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buildings Insurance */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <Shield size={20} className="text-blue-600" />
                            Buildings Insurance
                        </h4>
                        <button
                            onClick={() => onEditSection('insurance')}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider</p>
                                <p className="text-lg font-black text-slate-900">{property.buildingsInsurance?.provider || 'Not Set'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Premium</p>
                                <p className="text-lg font-black text-emerald-600">£{property.buildingsInsurance?.premium || 0}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p>
                                <p className="text-sm font-bold text-slate-700">{property.buildingsInsurance?.renewalDate || '-'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Policy</p>
                                <p className="font-mono text-xs font-bold text-slate-500">{property.buildingsInsurance?.policyNumber || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Utilities */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <Zap size={20} className="text-amber-500" />
                            Utility Providers
                        </h4>
                        <button
                            onClick={() => onEditSection('utilities')}
                            className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                            Manage
                        </button>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="space-y-2">
                            {property.utilities.length > 0 ? property.utilities.map((util, i) => (
                                <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100">
                                            {util.type[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{util.type}</p>
                                            <p className="text-sm font-black text-slate-900">{util.providerName}</p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                        #{util.accountNumber}
                                    </span>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400 text-sm italic">No utilities listed.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Care */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <Wrench size={20} className="text-blue-400" />
                            Product Cover
                        </h4>
                        <button
                            onClick={() => onEditSection('product_care')}
                            className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                            Add New
                        </button>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="space-y-2">
                            {property.productInsurances && property.productInsurances.length > 0 ? property.productInsurances.map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 truncate">{p.itemName}</p>
                                        <p className="text-xs text-slate-500 font-medium">{p.provider} • £{p.premium}/yr</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Renewal</p>
                                            <p className="text-xs font-bold text-slate-700">{p.renewalDate}</p>
                                        </div>
                                        <button
                                            onClick={() => onRemoveProduct(i)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400 text-sm italic">No cover policies listed.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceSection;
