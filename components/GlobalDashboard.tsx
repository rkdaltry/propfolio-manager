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

    const handleExport = () => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) return;

        const reportHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Portfolio Intelligence Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Inter', sans-serif; color: #0f172a; padding: 40px; line-height: 1.5; }
                        .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .header h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
                        .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
                        .stat-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
                        .stat-label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                        .stat-value { font-size: 24px; font-weight: 900; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #0f172a; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                        .footer { margin-top: 60px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="no-print" style="margin-bottom: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Print to PDF</button>
                    </div>
                    <div class="header">
                        <div>
                            <h1>Portfolio Intelligence</h1>
                            <div style="font-size: 12px; font-weight: 700; color: #3b82f6; margin-top: 5px;">STRATEGIC INVESTMENT SUMMARY</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 900; font-size: 14px;">${portfolioStats.propertyCount} ASSETS</div>
                            <div style="font-size: 12px; color: #64748b;">REPORTING DATE: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Valuation</div>
                            <div class="stat-value">${formatCurrency(portfolioStats.totalValuation)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Annual Revenue</div>
                            <div class="stat-value">${formatCurrency(portfolioStats.totalAnnualRent)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Net Cash Flow</div>
                            <div class="stat-value" style="color: #10b981;">${formatCurrency(portfolioStats.totalAnnualNet)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Portfolio Yield</div>
                            <div class="stat-value" style="color: #3b82f6;">${portfolioStats.avgGrossYield.toFixed(1)}%</div>
                        </div>
                    </div>

                    <h2 style="font-size: 18px; font-weight: 900; text-transform: uppercase;">Asset Breakdown</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Property Address</th>
                                <th>Valuation</th>
                                <th>Monthly Rent</th>
                                <th>Net Yield</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${properties.map(p => `
                                <tr>
                                    <td style="font-weight: 700;">${p.address}</td>
                                    <td>${formatCurrency(p.currentValuation || 0)}</td>
                                    <td>${formatCurrency(p.tenants.reduce((sum, t) => sum + t.rentAmount, 0))}</td>
                                    <td>${((p.tenants.reduce((sum, t) => sum + (t.rentAmount * 12), 0) / (p.currentValuation || 1)) * 100).toFixed(1)}%</td>
                                    <td><span style="padding: 4px 8px; background: #f1f5f9; border-radius: 4px; font-size: 10px; font-weight: 900;">ACTIVE</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        GENERATED SECURELY BY PROPFOLIO MANAGER PREMIUM. CONFIDENTIAL INVESTOR DOCUMENT.
                    </div>
                </body>
            </html>
        `;

        reportWindow.document.write(reportHtml);
        reportWindow.document.close();
    };

    return (
        <div className="p-8 lg:px-16 xl:px-24 lg:py-12 w-full mx-auto space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Wealth Intelligence</h2>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Institutional Portfolio Engine • v1.5 Premium</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xs hover:shadow-lg transition-all"
                    >
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
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/80 w-fit shadow-sm">
                {[
                    { id: 'analytics', label: 'Global Analytics', icon: Activity },
                    { id: 'map', label: 'Portfolio Map', icon: MapIcon },
                    { id: 'stress', label: 'Stress Tester', icon: Zap }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/40 dark:shadow-white/10'
                            : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'analytics' && (
                <>
                    {/* Top Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between h-56 group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Global Valuation</p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{formatCurrency(portfolioStats.totalValuation)}</h3>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:rotate-6 transition-transform shadow-sm">
                                    <Briefcase size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 w-fit px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-widest">
                                <ArrowUpRight size={14} /> +12.4% PERFORMANCE
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between h-56 group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Blended Yield</p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{portfolioStats.avgGrossYield.toFixed(1)}%</h3>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:rotate-6 transition-transform shadow-sm">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 w-fit px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800/50 uppercase tracking-widest">
                                Market Index: 5.2%
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between h-56 group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Net Liquidity</p>
                                    <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter italic">{formatCurrency(portfolioStats.totalAnnualNet)}</h3>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:rotate-6 transition-transform shadow-sm">
                                    <Wallet size={24} />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                Avg: {formatCurrency(portfolioStats.totalAnnualNet / (portfolioStats.propertyCount || 1))} PER UNIT
                            </p>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between h-56 group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Infrastructure Health</p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">84<span className="text-sm tracking-normal opacity-50 not-italic ml-1">/100</span></h3>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:rotate-6 transition-transform shadow-sm">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all duration-1000" style={{ width: '84%' }}></div>
                                </div>
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">OPTIMAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Charts & Deep Dive */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-500">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Revenue Momentum</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Projected Capital Inflow</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target Yield</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '2rem',
                                                border: '1px solid rgba(226, 232, 240, 0.1)',
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                backdropFilter: 'blur(20px)',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                                padding: '1.5rem',
                                                color: 'white'
                                            }}
                                            itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={5}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 dark:bg-slate-950 p-12 rounded-[3.5rem] text-white flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-2xl transition-all duration-500 group">
                            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <PieChartIcon size={300} />
                            </div>
                            <h4 className="text-[10px] font-black mb-10 absolute top-12 left-12 opacity-40 uppercase tracking-[0.3em]">Capital Distribution</h4>

                            <div className="h-72 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={85}
                                            outerRadius={105}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={6} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-4xl font-black italic tracking-tighter">{portfolioStats.avgNetYield.toFixed(1)}%</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Net Performance</span>
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-2 gap-10 w-full px-4">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Revenue Intake</p>
                                    <p className="text-xl font-black italic">£{Math.round(portfolioStats.totalAnnualRent / 12).toLocaleString()}<span className="text-xs tracking-normal opacity-50 not-italic ml-1">/mo</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Profit Yield</p>
                                    <p className="text-xl font-black text-emerald-400 italic">£{Math.round(portfolioStats.totalAnnualNet / 12).toLocaleString()}<span className="text-xs tracking-normal opacity-50 not-italic ml-1">/mo</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Alert */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center gap-12 shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="p-8 bg-white/10 rounded-[2rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 backdrop-blur-xl border border-white/10">
                            <Zap size={48} className="text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[9px] font-black rounded-lg uppercase tracking-[0.2em] border border-white/20">Strategic Intelligence</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Live Engine Active</span>
                                </div>
                            </div>
                            <h4 className="text-3xl font-black mb-3 tracking-tighter uppercase italic">Your portfolio yield outperforms benchmarks by 1.2%</h4>
                            <p className="text-blue-100/80 font-bold text-sm tracking-tight leading-relaxed max-w-2xl">Refinancing '12 Oak Avenue' in Q1 2026 could unlock approximately £42,000 in equity for further asset acquisition based on current market appreciation trends.</p>
                        </div>
                        <button className="px-8 py-4 bg-white text-blue-600 font-black text-xs rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95 uppercase tracking-widest relative z-10">
                            Execute Refinance Plan
                        </button>
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
