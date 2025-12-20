import React, { useMemo, useState } from 'react';
import { useData } from '../DataContext';
import {
    Home, Plus, ChevronRight, ShieldAlert, CheckCircle2, Check,
    Users, Crown, Clock, Coins, TrendingUp, TrendingDown, Wallet, MapPin,
    ArrowUpRight, ArrowDownRight, Building2, FileText, Bell, Filter, ChevronDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getComplianceStatus } from '../utils';

const Dashboard: React.FC = () => {
    const { properties } = useData();
    const navigate = useNavigate();

    // Owner filter state
    const [selectedOwner, setSelectedOwner] = useState<string>('all');

    // Extract unique owners from properties
    const owners = useMemo(() => {
        const ownerSet = new Set(properties.map(p => p.owner).filter(Boolean));
        return ['all', ...Array.from(ownerSet)] as string[];
    }, [properties]);

    // Filter properties based on selected owner
    const filteredProperties = useMemo(() => {
        if (selectedOwner === 'all') return properties;
        return properties.filter(p => p.owner === selectedOwner);
    }, [properties, selectedOwner]);

    const stats = useMemo(() => {
        let rentedCount = 0;
        let totalUnits = 0;

        filteredProperties.forEach(p => {
            const activeTenants = p.tenants.filter(t => !t.isDeleted);
            const liveRecords = activeTenants.filter(t => !t.isArchived);
            const propCapacity = p.capacity || Math.max(liveRecords.length, 1);
            totalUnits += propCapacity;
            const currentOccupants = liveRecords.filter(t => t.name !== 'Empty' && t.rentAmount > 0).length;
            rentedCount += currentOccupants;
        });
        const unoccupiedCount = Math.max(0, totalUnits - rentedCount);
        const occupancyRate = totalUnits > 0 ? Math.round((rentedCount / totalUnits) * 100) : 0;

        return { rentedCount, unoccupiedCount, totalUnits, occupancyRate };
    }, [filteredProperties]);

    const pieData = [
        { name: 'Rented', value: stats.rentedCount, color: '#2563eb' }, // blue-600
        { name: 'Unoccupied', value: stats.unoccupiedCount, color: '#e2e8f0' }, // slate-200
    ];

    const financialStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let monthIncome = 0; let monthExpense = 0; let yearIncome = 0; let yearExpense = 0;

        filteredProperties.forEach(p => {
            // Add monthly rent from active tenants
            const activeTenants = p.tenants.filter(t => !t.isDeleted && !t.isArchived && t.rentAmount > 0);
            const monthlyRent = activeTenants.reduce((sum, t) => sum + Number(t.rentAmount || 0), 0);
            monthIncome += monthlyRent;
            yearIncome += monthlyRent * 12; // Annualized rent

            // Also count any recorded transactions
            (p.transactions || []).forEach(tx => {
                const txDate = new Date(tx.date);
                const amount = Number(tx.amount);
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    if (tx.type === 'Expense') monthExpense += amount;
                }
                if (txDate.getFullYear() === currentYear) {
                    if (tx.type === 'Expense') yearExpense += amount;
                }
            });
        });
        return {
            month: { income: monthIncome, expense: monthExpense, profit: monthIncome - monthExpense },
            year: { income: yearIncome, expense: yearExpense, profit: yearIncome - yearExpense }
        };
    }, [filteredProperties]);

    const reminders = useMemo(() => {
        const list: { type: 'urgent' | 'warning' | 'info', title: string, subtitle: string, icon: any, date?: string, id: string }[] = [];
        const now = new Date();

        filteredProperties.forEach(p => {
            const address = p.address.split(',')[0];
            p.tenants.filter(t => !t.isDeleted && !t.isArchived).forEach(t => {
                if (t.outstandingBalance > 0) {
                    list.push({ type: 'urgent', title: `Overdue Rent: ${t.name}`, subtitle: `${address} - Owed: £${t.outstandingBalance}`, icon: Coins, id: `rent_${t.id}` });
                }
                if (t.tenancyEndDate) {
                    const endDate = new Date(t.tenancyEndDate);
                    const diff = endDate.getTime() - now.getTime();
                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    if (days > 0 && days <= 60) {
                        list.push({ type: 'info', title: 'Tenancy Ending', subtitle: `${t.name} (${days} days)`, icon: Users, date: t.tenancyEndDate, id: `end_${t.id}` });
                    }
                }
            });

            const checkExpiry = (dateStr: string | undefined, label: string) => {
                if (!dateStr) return;
                const date = new Date(dateStr);
                const diff = date.getTime() - now.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                if (days < 0) list.push({ type: 'urgent', title: `Expired: ${label}`, subtitle: address, icon: ShieldAlert, date: dateStr, id: `exp_${label}_${p.id}` });
                else if (days < 30) list.push({ type: 'warning', title: `Renew: ${label}`, subtitle: `${address} (Due in ${days} days)`, icon: Clock, date: dateStr, id: `warn_${label}_${p.id}` });
            };
            checkExpiry(p.gasCertificate?.expiryDate, 'Gas Safety');
            checkExpiry(p.eicrCertificate?.expiryDate, 'EICR');
            checkExpiry(p.buildingsInsurance?.renewalDate, 'Insurance');
        });
        return list.sort((a, b) => {
            const priority = { urgent: 0, warning: 1, info: 2 };
            if (priority[a.type] !== priority[b.type]) return priority[a.type] - priority[b.type];
            if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
            return 0;
        }).slice(0, 5);
    }, [filteredProperties]);

    return (
        <div className="p-5 lg:px-16 xl:px-24 lg:py-12 w-full mx-auto space-y-8 animate-fade-in pb-20 lg:pb-12">
            {/* Header with Filter and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Owner Filter */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Filter size={16} />
                        <span>Filter by Owner:</span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedOwner}
                            onChange={(e) => setSelectedOwner(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                        >
                            {owners.map(owner => (
                                <option key={owner} value={owner}>
                                    {owner === 'all' ? 'All Owners' : owner}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {selectedOwner !== 'all' && (
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
                            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button onClick={() => navigate('/properties')} className="px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                        View Properties
                    </button>
                    <button onClick={() => navigate('/add')} className="px-6 py-3.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                        <Plus size={20} /> Add Property
                    </button>
                </div>
            </div>


            {/* Dashboard Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Properties Card */}
                <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700">
                        <Building2 size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Portfolio</p>
                                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Total Properties</h4>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100/50 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                                <Building2 size={22} strokeWidth={2.5} />
                            </div>
                        </div>
                        {/* Value */}
                        <div className="flex items-baseline gap-2 mt-4">
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{properties.length}</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase">Assets</span>
                        </div>
                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight size={14} strokeWidth={3} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Active Portfolio</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Occupancy Rate Card */}
                <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-700">
                        <Users size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Status</p>
                                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Occupancy Rate</h4>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100/50 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
                                <Users size={22} strokeWidth={2.5} />
                            </div>
                        </div>
                        {/* Value */}
                        <div className="flex items-baseline gap-1 mt-4">
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.occupancyRate}</h3>
                            <span className="text-xl font-black text-slate-300 dark:text-slate-600">%</span>
                        </div>
                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stats.rentedCount} of {stats.totalUnits} units</span>
                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${stats.occupancyRate}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue Card */}
                <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
                        <Coins size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Cash Flow</p>
                                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Monthly Revenue</h4>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Wallet size={22} strokeWidth={2.5} />
                            </div>
                        </div>
                        {/* Value */}
                        <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-xl font-black text-slate-300 dark:text-slate-600">£</span>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{financialStats.month.income.toLocaleString()}</h3>
                        </div>
                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Income</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">+12.4%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className="relative group overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
                        <TrendingUp size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Efficiency</p>
                                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Net Profit</h4>
                            </div>
                            <div className={`p-3 rounded-2xl border group-hover:scale-110 transition-transform ${financialStats.month.profit >= 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-100/50 dark:border-red-500/20'}`}>
                                <TrendingUp size={22} strokeWidth={2.5} />
                            </div>
                        </div>
                        {/* Value */}
                        <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-xl font-black text-slate-300 dark:text-slate-600">£</span>
                            <h3 className={`text-4xl font-black tracking-tight ${financialStats.month.profit >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                {financialStats.month.profit.toLocaleString()}
                            </h3>
                        </div>
                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${financialStats.month.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{financialStats.month.profit >= 0 ? 'Healthy' : 'Deficit'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Properties List */}
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden transition-all duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight italic uppercase">Properties Overview</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Asset Performance</p>
                            </div>
                            <button onClick={() => navigate('/properties')} className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-black rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredProperties.slice(0, 5).map(property => {
                                const compliance = getComplianceStatus(property);
                                const liveTenants = property.tenants.filter(t => !t.isDeleted);
                                const occupiedCount = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived).length;
                                const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
                                const vacant = Math.max(0, propCapacity - occupiedCount);

                                return (
                                    <div key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-center gap-6 group">
                                        <div className="relative">
                                            <img src={property.imageUrl} alt={property.address} className="w-20 h-16 object-cover rounded-2xl shadow-sm bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform" />
                                            {vacant > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 dark:text-white text-base truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{property.address.split(',')[0]}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin size={12} className="text-slate-400" />
                                                <p className="text-xs font-bold text-slate-400 truncate uppercase tracking-widest">{property.address.split(',').slice(1).join(', ')}</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-3">
                                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${vacant === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50'}`}>
                                                {vacant === 0 ? 'Occupied' : `${vacant} Vacant`}
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${compliance.bg.replace('bg-', 'bg-').replace('-100', '-50 dark:bg-opacity-20')} ${compliance.color.replace('text-', 'text-').replace('-600', '-600 dark:text-opacity-80')} ${compliance.bg.replace('bg-', 'border-').replace('-100', '-100/50 dark:border-opacity-30')}`}>
                                                <compliance.icon size={12} />
                                                <span>{compliance.label}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Chart Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800/80 p-10 transition-colors duration-300">
                            <div className="mb-10">
                                <h3 className="font-black text-slate-900 dark:text-white text-xl italic uppercase tracking-tight">Occupancy Split</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Portfolio Saturation</p>
                            </div>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalUnits}</span>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Units Total</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-10 mt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50"></div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Rented ({stats.rentedCount})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner"></div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Available ({stats.unoccupiedCount})</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800/80 p-10 flex flex-col transition-colors duration-300">
                            <div className="mb-10 flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-xl italic uppercase tracking-tight">Financial Ledger</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recent Transactions</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                    <Coins size={20} />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                {filteredProperties.flatMap(p => (p.transactions || []).map(t => ({ ...t, propertyAddress: p.address })))
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 5)
                                    .map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl shadow-sm ${tx.type === 'Income' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                                                    {tx.type === 'Income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{tx.description || tx.category}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-base font-black ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                {tx.type === 'Income' ? '+' : '-'}£{Number(tx.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Setup Progress */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-500/20 dark:shadow-blue-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Building2 size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <ArrowUpRight size={18} />
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Live Onboarding</span>
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter mb-2">20% <span className="text-lg opacity-60 font-medium">Complete</span></h3>
                            <div className="w-full h-3 bg-white/20 rounded-full mb-8 overflow-hidden shadow-inner">
                                <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: '20%' }}></div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Add a property', done: properties.length > 0 },
                                    { label: 'Check compliance', done: false },
                                    { label: 'Add documents', done: false }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 group/item">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${item.done ? 'bg-white border-white' : 'border-white/30 group-hover/item:border-white/60'}`}>
                                            {item.done && <Check size={14} className="text-blue-600 font-bold" />}
                                        </div>
                                        <span className={`text-[13px] font-bold tracking-tight transition-opacity ${item.done ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Center */}
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-xl italic uppercase tracking-tight">Action Center</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Immediate Tasks</p>
                            </div>
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-red-500/30">
                                {reminders.length}
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {reminders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All caught up!</p>
                                </div>
                            ) : (
                                reminders.map((item) => (
                                    <div key={item.id} className="p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 group bg-slate-50/30 dark:bg-slate-800/20">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl transition-colors ${item.type === 'urgent' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-100' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100'}`}>
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{item.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;