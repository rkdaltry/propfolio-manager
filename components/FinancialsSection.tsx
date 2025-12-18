import React from 'react';
import { Property, PropertyType } from '../types';
import { CreditCard, TrendingUp, TrendingDown, Wallet, Landmark, Percent, CalendarClock, Building2, ChevronRight } from 'lucide-react';
import { getExpiryStyle } from './PropertyDetailComponents';

interface FinancialsSectionProps {
    property: Property;
    onEditSection: (section: string) => void;
}

const FinancialsSection: React.FC<FinancialsSectionProps> = ({ property, onEditSection }) => {
    // Financial Stats Calculation
    const financialStats = React.useMemo(() => {
        let income = 0;
        let expense = 0;
        (property.transactions || []).forEach(tx => {
            if (tx.type === 'Income') income += Number(tx.amount);
            else expense += Number(tx.amount);
        });
        return { income, expense, profit: income - expense };
    }, [property.transactions]);

    const mortgageStyle = getExpiryStyle(property.mortgage?.fixedRateExpiry);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Financial Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Income</p>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-3xl font-black text-slate-900">£{financialStats.income.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown size={80} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Total Expenses</p>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-3xl font-black text-slate-900">£{financialStats.expense.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-blue-600 shadow-xl shadow-blue-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-600">
                        <Wallet size={80} />
                    </div>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Net Profit</p>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                            <Wallet size={24} />
                        </div>
                        <span className="text-3xl font-black text-slate-900">£{financialStats.profit.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mortgage Deep Dive */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <CreditCard size={20} className="text-blue-600" />
                            Mortgage Details
                        </h4>
                        <button
                            onClick={() => onEditSection('financials')}
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            Update
                        </button>
                    </div>
                    <div className="p-8 space-y-8 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lender</p>
                                <div className="flex items-center gap-2">
                                    <Building2 size={24} className="text-slate-400" />
                                    <span className="text-xl font-black text-slate-900">{property.mortgage?.lenderName || 'No Lender Set'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rate</p>
                                <div className="flex items-center justify-end gap-1.5 text-2xl font-black text-blue-600">
                                    <Percent size={20} className="text-blue-400" />
                                    {property.mortgage?.interestRate}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Payment</p>
                                <p className="text-2xl font-black text-slate-900">£{property.mortgage?.monthlyPayment || 0}</p>
                                <p className="text-xs text-slate-500 font-bold mt-1">{property.mortgage?.type || 'Standard'}</p>
                            </div>
                            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${mortgageStyle.class}`}>
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Rate Expiry</p>
                                <div>
                                    <p className="text-lg font-black">{property.mortgage?.fixedRateExpiry ? new Date(property.mortgage.fixedRateExpiry).toLocaleDateString() : 'N/A'}</p>
                                    <p className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-wider">{mortgageStyle.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <Landmark size={20} className="text-emerald-600" />
                            Transaction Ledger
                        </h4>
                        <button
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="p-4 flex-1">
                        {property.transactions && property.transactions.length > 0 ? (
                            <div className="space-y-2">
                                {property.transactions.slice(0, 5).map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{tx.description || tx.category}</p>
                                                <p className="text-xs text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-lg font-black ${tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {tx.type === 'Income' ? '+' : '-'}£{tx.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <p className="text-slate-400 text-sm italic">No recent transactions recorded.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialsSection;
