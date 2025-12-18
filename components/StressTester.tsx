import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import {
    Activity,
    TrendingDown,
    AlertTriangle,
    ShieldCheck,
    Info,
    ArrowRight,
    Zap,
    Percent,
    PieChart
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface StressTesterProps {
    properties: Property[];
}

const StressTester: React.FC<StressTesterProps> = ({ properties }) => {
    const [interestDelta, setInterestDelta] = useState(0); // +/- percentage points
    const [vacancyTarget, setVacancyTarget] = useState(0); // percentage of portfolio

    const simulation = useMemo(() => {
        let currentAnnualNet = 0;
        let projectedAnnualNet = 0;
        let totalValuation = 0;

        properties.forEach(p => {
            const valuation = p.currentValuation || 0;
            totalValuation += valuation;

            // 1. Current Annuals
            const monthlyRent = p.tenants
                .filter(t => !t.isArchived && !t.isDeleted)
                .reduce((sum, t) => sum + t.rentAmount, 0);
            const annualGross = monthlyRent * 12;

            const monthlyMortgage = p.mortgage?.monthlyPayment || 0;
            const annualExpenses = (monthlyMortgage * 12) +
                (p.buildingsInsurance?.premium || 0) +
                p.productInsurances.reduce((sum, pi) => sum + pi.premium, 0) +
                (p.councilTax?.annualCost || 0) + (p.groundRent?.amount || 0);

            const annualMaintenance = (p.maintenanceTickets || [])
                .filter(t => t.cost)
                .reduce((sum, t) => sum + (t.cost || 0), 0);

            const net = annualGross - annualExpenses - annualMaintenance;
            currentAnnualNet += net;

            // 2. Projected (Interest Rate Stress)
            // Estimate mortgage impact: if rate rises by interestDelta, payment increases
            // Rough estimation: payment ~ Principal * Rate / 12. 
            // We'll estimate Principal as ~75% of Valuation (LTV) if mortgage exists.
            let extraMortgage = 0;
            if (p.mortgage) {
                const estimatedPrincipal = valuation * 0.75;
                extraMortgage = (estimatedPrincipal * (interestDelta / 100));
            }

            // 3. Projected (Vacancy Stress)
            // Reduce gross rent by vacancy percentage
            const vacancyLoss = annualGross * (vacancyTarget / 100);

            projectedAnnualNet += (net - extraMortgage - vacancyLoss);
        });

        const profitImpact = currentAnnualNet > 0 ? ((projectedAnnualNet - currentAnnualNet) / currentAnnualNet) * 100 : 0;
        const currentYield = totalValuation > 0 ? (currentAnnualNet / totalValuation) * 100 : 0;
        const projectedYield = totalValuation > 0 ? (projectedAnnualNet / totalValuation) * 100 : 0;

        return {
            currentAnnualNet,
            projectedAnnualNet,
            profitImpact,
            currentYield,
            projectedYield,
            isCritical: projectedAnnualNet < 0,
            safetyMargin: (projectedAnnualNet / Math.max(1, currentAnnualNet)) * 100
        };
    }, [properties, interestDelta, vacancyTarget]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-10">
            {/* Simulation Controls */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                            <Zap size={20} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Stress Controls</h4>
                    </div>

                    <div className="space-y-10">
                        {/* Interest Rate Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Interest Rate Rise</label>
                                <span className={`text-lg font-black ${interestDelta > 2 ? 'text-red-500' : 'text-blue-600'}`}>+{interestDelta}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={interestDelta}
                                onChange={(e) => setInterestDelta(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300">
                                <span>CURRENT</span>
                                <span>SEVERE (+10%)</span>
                            </div>
                        </div>

                        {/* Vacancy Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Vacancy</label>
                                <span className="text-lg font-black text-purple-600">{vacancyTarget}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="5"
                                value={vacancyTarget}
                                onChange={(e) => setVacancyTarget(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300">
                                <span>OPTIMAL</span>
                                <span>REDLINE (50%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-start gap-3">
                        <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                            Simulations are based on an estimated 75% LTV across mortgaged assets and total annual fixed costs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Impact Visualization */}
            <div className="lg:col-span-2 space-y-6">
                {/* Result Hero */}
                <div className={`p-10 rounded-[3rem] border transition-all duration-500 ${simulation.isCritical ? 'bg-red-50 border-red-200 shadow-xl shadow-red-100' : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/30'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Simulated Net Annual Profit</h4>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-6xl font-black tracking-tighter ${simulation.isCritical ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                    {formatCurrency(simulation.projectedAnnualNet)}
                                </span>
                                <span className={`text-sm font-black flex items-center gap-1 ${simulation.profitImpact < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {simulation.profitImpact < 0 ? <TrendingDown size={14} /> : null}
                                    {simulation.profitImpact.toFixed(0)}% Impact
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="50"
                                        fill="none"
                                        stroke={simulation.isCritical ? '#ef4444' : '#10b981'}
                                        strokeWidth="12"
                                        strokeDasharray={314}
                                        strokeDashoffset={314 - (314 * Math.max(0, simulation.safetyMargin) / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black">{simulation.safetyMargin.toFixed(0)}%</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Margin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparative Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <PieChart size={100} />
                        </div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Yield Compression</h5>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400">Current Net Yield</span>
                                <span className="text-xl font-black">{simulation.currentYield.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                <span className="text-sm font-bold text-slate-400">Projected Net Yield</span>
                                <span className={`text-xl font-black ${simulation.isCritical ? 'text-red-400' : 'text-blue-400'}`}>
                                    {simulation.projectedYield.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-850 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Risk Assessment</h5>
                            {simulation.isCritical ? (
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertTriangle size={24} />
                                    <p className="text-lg font-black tracking-tight uppercase">Critical Exposure</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <ShieldCheck size={24} />
                                    <p className="text-lg font-black tracking-tight uppercase">Hedge Stable</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-4">
                            {simulation.isCritical
                                ? "Projected fixed costs exceed cash flow. Consider defensive disposition or rate hedging immediately."
                                : "Current equity position and leverage are resilient to this economic shift. Maintenance of current strategy recommended."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StressTester;
