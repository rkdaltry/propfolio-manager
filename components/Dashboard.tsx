import React, { useMemo } from 'react';
import { useData } from '../DataContext';
import {
    Home, Plus, ChevronRight, ShieldAlert, CheckCircle2,
    Users, Crown, Clock, Coins, TrendingUp, TrendingDown, Wallet, MapPin,
    ArrowUpRight, ArrowDownRight, Building2, FileText, Bell
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getComplianceStatus } from '../utils';

const Dashboard: React.FC = () => {
    const { properties } = useData();
    const navigate = useNavigate();

    const stats = useMemo(() => {
        let rentedCount = 0;
        let totalUnits = 0;

        properties.forEach(p => {
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
    }, [properties]);

    const pieData = [
        { name: 'Rented', value: stats.rentedCount, color: '#2563eb' }, // blue-600
        { name: 'Unoccupied', value: stats.unoccupiedCount, color: '#e2e8f0' }, // slate-200
    ];

    const financialStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let monthIncome = 0; let monthExpense = 0; let yearIncome = 0; let yearExpense = 0;

        properties.forEach(p => {
            (p.transactions || []).forEach(tx => {
                const txDate = new Date(tx.date);
                const amount = Number(tx.amount);
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    if (tx.type === 'Income') monthIncome += amount; else monthExpense += amount;
                }
                if (txDate.getFullYear() === currentYear) {
                    if (tx.type === 'Income') yearIncome += amount; else yearExpense += amount;
                }
            });
        });
        return {
            month: { income: monthIncome, expense: monthExpense, profit: monthIncome - monthExpense },
            year: { income: yearIncome, expense: yearExpense, profit: yearIncome - yearExpense }
        };
    }, [properties]);

    const reminders = useMemo(() => {
        const list: { type: 'urgent' | 'warning' | 'info', title: string, subtitle: string, icon: any, date?: string, id: string }[] = [];
        const now = new Date();

        properties.forEach(p => {
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
    }, [properties]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/properties')} className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                        View Properties
                    </button>
                    <button onClick={() => navigate('/properties')} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
                        <Plus size={18} /> Add Property
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Properties</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{properties.length}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Building2 size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                        <ArrowUpRight size={12} />
                        <span>Active Portfolio</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Occupancy Rate</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.occupancyRate}%</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">£{financialStats.month.income.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <span>vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Net Profit</p>
                            <h3 className={`text-3xl font-bold mt-1 ${financialStats.month.profit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                £{financialStats.month.profit.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <span>Current Month</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Properties List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 text-lg">Properties Overview</h3>
                            <button onClick={() => navigate('/properties')} className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
                                View All <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {properties.slice(0, 5).map(property => {
                                const compliance = getComplianceStatus(property);
                                const liveTenants = property.tenants.filter(t => !t.isDeleted);
                                const occupiedCount = liveTenants.filter(t => t.rentAmount > 0 && t.name !== 'Empty' && !t.isArchived).length;
                                const propCapacity = property.capacity || Math.max(liveTenants.filter(t => !t.isArchived).length, 1);
                                const vacant = Math.max(0, propCapacity - occupiedCount);

                                return (
                                    <div key={property.id} onClick={() => navigate(`/properties/${property.id}`)} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-4 group">
                                        <img src={property.imageUrl} alt={property.address} className="w-16 h-12 object-cover rounded-lg shadow-sm bg-slate-200" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{property.address.split(',')[0]}</h4>
                                            <p className="text-xs text-slate-500 truncate">{property.address.split(',').slice(1).join(', ')}</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${vacant === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {vacant === 0 ? 'Occupied' : `${vacant} Vacant`}
                                            </span>
                                        </div>
                                        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${compliance.bg} ${compliance.color.replace('text-', 'text-opacity-100 text-')}`}>
                                            <compliance.icon size={12} />
                                            <span>{compliance.label}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                                    </div>
                                );
                            })}
                            {properties.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    <Home size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p>No properties added yet.</p>
                                    <button onClick={() => navigate('/properties')} className="mt-4 text-blue-600 font-bold hover:underline">Add your first property</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Chart Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-900 text-lg mb-6">Occupancy Split</h3>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-slate-900">{stats.totalUnits}</span>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Units</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                    <span className="text-sm text-slate-600">Rented ({stats.rentedCount})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    <span className="text-sm text-slate-600">Unoccupied ({stats.unoccupiedCount})</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                            <h3 className="font-bold text-slate-900 text-lg mb-4">Recent Transactions</h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {properties.flatMap(p => (p.transactions || []).map(t => ({ ...t, propertyAddress: p.address })))
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 6)
                                    .map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tx.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.type === 'Income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{tx.description || tx.category}</p>
                                                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.type === 'Income' ? '+' : '-'}£{Number(tx.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                {properties.every(p => !p.transactions || p.transactions.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                        <p>No transactions yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Getting Started */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Crown size={120} />
                        </div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 relative z-10">
                            <Crown size={20} className="text-yellow-300" /> Setup Progress
                        </h3>
                        <div className="flex items-end gap-2 mb-4 relative z-10">
                            <span className="text-4xl font-bold">20%</span>
                            <span className="text-blue-200 text-sm mb-1">completed</span>
                        </div>
                        <div className="w-full bg-blue-900/30 h-1.5 rounded-full mb-6 relative z-10">
                            <div className="bg-yellow-400 h-full rounded-full w-[20%]"></div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {[{ label: 'Add a property', done: properties.length > 0 }, { label: 'Check compliance', done: false }, { label: 'Add documents', done: false }].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-400 text-blue-900' : 'border-2 border-blue-400/50'}`}>
                                        {step.done && <CheckCircle2 size={12} />}
                                    </div>
                                    <span className={step.done ? 'text-white' : 'text-blue-100'}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Center */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Action Center</h3>
                            {reminders.length > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{reminders.length}</span>}
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                            {reminders.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
                                    <p className="text-sm">All caught up!</p>
                                </div>
                            ) : (
                                reminders.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                                        <div className={`mt-0.5 p-1.5 rounded-lg h-fit ${item.type === 'urgent' ? 'bg-red-100 text-red-600' : item.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <item.icon size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
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