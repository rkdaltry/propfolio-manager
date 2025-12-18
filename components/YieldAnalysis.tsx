import React, { useMemo } from 'react';
import { Property, FinancialTransaction } from '../types';
import { TrendingUp, PieChart, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Percent, Info } from 'lucide-react';
import { formatCurrency } from '../utils';

interface YieldAnalysisProps {
    property: Property;
}

const YieldAnalysis: React.FC<YieldAnalysisProps> = ({ property }) => {
    const stats = useMemo(() => {
        // 1. Annual Income (based on active tenants)
        const monthlyIncome = property.tenants
            .filter(t => !t.isArchived && !t.isDeleted && t.rentAmount > 0)
            .reduce((sum, t) => sum + t.rentAmount, 0);
        const annualGrossIncome = monthlyIncome * 12;

        // 2. Annual Expenses
        const monthlyMortgage = property.mortgage?.monthlyPayment || 0;
        const annualMortgage = monthlyMortgage * 12;

        const annualInsurance = (property.buildingsInsurance?.premium || 0) +
            property.productInsurances.reduce((sum, pi) => sum + pi.premium, 0);

        const annualCivic = (property.councilTax?.annualCost || 0) + (property.groundRent?.amount || 0);

        // Maintenance (last 12 months)
        const maintenanceTotal = (property.maintenanceTickets || [])
            .filter(t => t.cost)
            .reduce((sum, t) => sum + (t.cost || 0), 0);

        const annualExpenses = annualMortgage + annualInsurance + annualCivic + maintenanceTotal;
        const netOperatingIncome = annualGrossIncome - annualExpenses;

        // 3. Yields
        const valuation = property.currentValuation || 0;
        const grossYield = valuation > 0 ? (annualGrossIncome / valuation) * 100 : 0;
        const netYield = valuation > 0 ? (netOperatingIncome / valuation) * 100 : 0;

        return {
            annualGrossIncome,
            annualExpenses,
            netOperatingIncome,
            grossYield,
            netYield,
            valuation,
            breakdown: [
                { name: 'Mortgage', value: annualMortgage, color: 'bg-blue-500' },
                { name: 'Insurance', value: annualInsurance, color: 'bg-purple-500' },
                { name: 'Maintenance', value: maintenanceTotal, color: 'bg-orange-500' },
                { name: 'Tax & Ground', value: annualCivic, color: 'bg-slate-500' }
            ]
        };
    }, [property]);

    if (!stats.valuation) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                    <Info size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Valuation Required</h4>
                <p className="text-slate-500 max-w-xs font-medium">Please add a current valuation for this property to unlock yield analysis and ROI tracking.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Yield Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-blue-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Percent size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross Yield</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900">{stats.grossYield.toFixed(1)}%</span>
                        <span className="text-emerald-500 font-bold flex items-center text-sm">
                            <ArrowUpRight size={16} /> Market Avg: 5.2%
                        </span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-emerald-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
                            <Activity size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Yield</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900">{stats.netYield.toFixed(1)}%</span>
                        <span className="text-emerald-500 font-bold flex items-center text-sm">
                            <ArrowUpRight size={16} /> Healthy
                        </span>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Expense Breakdown */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-lg font-black text-slate-900">Annual Expense Breakdown</h4>
                        <span className="text-slate-400 text-sm font-bold">Total: {formatCurrency(stats.annualExpenses)}</span>
                    </div>

                    <div className="space-y-6">
                        <div className="h-6 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-inner">
                            {stats.breakdown.map((item, i) => (
                                <div
                                    key={i}
                                    className={`${item.color} h-full transition-all duration-1000`}
                                    style={{ width: `${(item.value / stats.annualExpenses) * 100}%` }}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.breakdown.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 pl-5">{formatCurrency(item.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profit/Loss Quick Stats */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/20">
                    <h4 className="text-lg font-black mb-8 opacity-60">Revenue Summary</h4>
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Gross Rent</p>
                            <p className="text-2xl font-black">{formatCurrency(stats.annualGrossIncome)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Net Cash Flow (Est.)</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-emerald-400">{formatCurrency(stats.netOperatingIncome)}</p>
                                <span className="text-xs font-bold text-slate-500">per year</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Net</p>
                            <p className="text-xl font-black text-blue-400">{formatCurrency(stats.netOperatingIncome / 12)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YieldAnalysis;
