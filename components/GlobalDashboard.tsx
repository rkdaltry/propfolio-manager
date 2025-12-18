import React, { useMemo, useState } from 'react';
import { useData } from '../DataContext';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Building2,
    Activity,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Briefcase,
    ShieldCheck,
    AlertTriangle,
    Wallet,
    Map as MapIcon,
    Zap,
    Download
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { formatCurrency } from '../utils';
import PortfolioMap from './PortfolioMap';
import StressTester from './StressTester';

const GlobalDashboard: React.FC = () => {
    const { properties } = useData();
    const [activeTab, setActiveTab] = useState<'analytics' | 'map' | 'stress'>('analytics');

    const portfolioStats = useMemo(() => {
        let totalValuation = 0;
        let totalAnnualRent = 0;
        let totalAnnualExpenses = 0;
        let totalMaintenanceCost = 0;

        properties.forEach(p => {
            totalValuation += p.currentValuation || 0;

            // Annual Rent
            const monthlyRent = p.tenants
                .filter(t => !t.isArchived && !t.isDeleted)
                .reduce((sum, t) => sum + t.rentAmount, 0);
            totalAnnualRent += monthlyRent * 12;

            // Annual Expenses (Mortgage + Insurance + Civic)
            const monthlyMortgage = p.mortgage?.monthlyPayment || 0;
            const annualInsurance = (p.buildingsInsurance?.premium || 0) +
                p.productInsurances.reduce((sum, pi) => sum + pi.premium, 0);
            const annualCivic = (p.councilTax?.annualCost || 0) + (p.groundRent?.amount || 0);

            totalAnnualExpenses += (monthlyMortgage * 12) + annualInsurance + annualCivic;

            // Maintenance
            totalMaintenanceCost += (p.maintenanceTickets || [])
                .filter(t => t.cost)
                .reduce((sum, t) => sum + (t.cost || 0), 0);
        });

        const totalAnnualNet = totalAnnualRent - totalAnnualExpenses - totalMaintenanceCost;
        const avgGrossYield = totalValuation > 0 ? (totalAnnualRent / totalValuation) * 100 : 0;
        const avgNetYield = totalValuation > 0 ? (totalAnnualNet / totalValuation) * 100 : 0;

        return {
            totalValuation,
            totalAnnualRent,
            totalAnnualNet,
            avgGrossYield,
            avgNetYield,
            propertyCount: properties.length
        };
    }, [properties]);

    // Simulated trend data (for visual impact)
    const trendData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 4500 },
        { name: 'Mar', value: 4200 },
        { name: 'Apr', value: 5000 },
        { name: 'May', value: 5500 },
        { name: 'Jun', value: 5300 },
    ];

    const distributionData = [
        { name: 'Rent', value: portfolioStats.totalAnnualRent, color: '#3b82f6' },
        { name: 'Profit', value: Math.max(0, portfolioStats.totalAnnualNet), color: '#10b981' },
    ];

    return (
        <div className="p-8 lg:p-12 w-full mx-auto space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Wealth Intelligence</h2>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Institutional Portfolio Engine • v1.5 Premium</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xs hover:shadow-lg transition-all">
                        <Download size={16} /> Export Report
                    </button>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl font-black text-sm">
                            Q4 2025
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-850 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 w-fit">
                {[
                    { id: 'analytics', label: 'Global Analytics', icon: Activity },
                    { id: 'map', label: 'Portfolio Map', icon: MapIcon },
                    { id: 'stress', label: 'Stress Tester', icon: Zap }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1.25rem] text-sm font-black transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/40'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'analytics' && (
                <>
                    {/* Top Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Portfolio Value</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formatCurrency(portfolioStats.totalValuation)}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:rotate-12 transition-transform">
                                    <Briefcase size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 w-fit px-3 py-1 rounded-full">
                                <ArrowUpRight size={14} /> +12.4% vs LY
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Gross Yield</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{portfolioStats.avgGrossYield.toFixed(1)}%</h3>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:rotate-12 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 bg-slate-50 dark:bg-slate-800 w-fit px-3 py-1 rounded-full">
                                Market Avg: 5.2%
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Net Cash Flow</p>
                                    <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(portfolioStats.totalAnnualNet)}</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:rotate-12 transition-transform">
                                    <Wallet size={24} />
                                </div>
                            </div>
                            <div className="text-xs font-bold text-slate-400">
                                Avg: {formatCurrency(portfolioStats.totalAnnualNet / (portfolioStats.propertyCount || 1))} / property
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-850 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Portfolio Health</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">84/100</h3>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:rotate-12 transition-transform">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }}></div>
                                </div>
                                <span className="text-[10px] font-black text-amber-600">PREMIUM</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Charts & Deep Dive */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-850 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white">Revenue Momentum</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-xs font-bold text-slate-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Projected Growth</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] w-full mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '1.5rem',
                                                border: 'none',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '1.25rem'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <PieChartIcon size={150} />
                            </div>
                            <h4 className="text-xl font-black mb-10 absolute top-10 left-10 opacity-60 uppercase tracking-[0.2em] text-[10px]">Financial Split</h4>

                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black">{portfolioStats.avgNetYield.toFixed(1)}%</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Net Yield</span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Rent</p>
                                    <p className="text-lg font-black">{formatCurrency(portfolioStats.totalAnnualRent / 12)} <span className="text-[10px] text-slate-600">/mo</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Cash</p>
                                    <p className="text-lg font-black text-emerald-400">{formatCurrency(portfolioStats.totalAnnualNet / 12)} <span className="text-[10px] text-slate-600">/mo</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Alert */}
                    <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex items-center gap-10 shadow-2xl shadow-blue-600/20 group">
                        <div className="p-6 bg-white/10 rounded-3xl group-hover:bg-white/20 transition-colors">
                            <Activity size={40} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Strategic Insight</span>
                                <span className="text-xs font-bold text-blue-200">AI AGENT ACTIVE</span>
                            </div>
                            <h4 className="text-2xl font-black mb-2 tracking-tight">Your portfolio yield outperforms market averages by 1.2%</h4>
                            <p className="text-blue-100 font-medium">Consider re-evaluating the valuation of '12 Oak Avenue' in early 2026 to optimize refinancing options.</p>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'map' && (
                <PortfolioMap properties={properties} />
            )}

            {activeTab === 'stress' && (
                <StressTester properties={properties} />
            )}
        </div>
    );
};

export default GlobalDashboard;
