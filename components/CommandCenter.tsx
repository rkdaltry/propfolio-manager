import React, { useMemo } from 'react';
import { useData } from '../DataContext';
import {
    Shield,
    Wrench,
    AlertCircle,
    Clock,
    CheckCircle2,
    ChevronRight,
    MapPin,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Activity,
    Users,
    Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getComplianceStatus } from '../utils';

const CommandCenter: React.FC = () => {
    const { properties } = useData();
    const navigate = useNavigate();

    const tasks = useMemo(() => {
        const list: any[] = [];
        const now = new Date();

        properties.forEach(p => {
            const address = p.address.split(',')[0];

            // 1. Maintenance Tickets
            (p.maintenanceTickets || []).forEach(ticket => {
                if (ticket.status !== 'Resolved' && ticket.status !== 'Cancelled') {
                    list.push({
                        id: ticket.id,
                        propertyId: p.id,
                        propertyName: address,
                        type: 'maintenance',
                        title: ticket.title,
                        priority: ticket.priority,
                        status: ticket.status,
                        date: ticket.reportedDate,
                        icon: Wrench,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50'
                    });
                }
            });

            // 2. Compliance Expiries
            const checkExpiry = (dateStr: string | undefined, label: string) => {
                if (!dateStr) return;
                const date = new Date(dateStr);
                const diff = date.getTime() - now.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                if (days < 60) {
                    list.push({
                        id: `${p.id}_${label}`,
                        propertyId: p.id,
                        propertyName: address,
                        type: 'compliance',
                        title: `${label} Renewal`,
                        priority: days < 0 ? 'Emergency' : (days < 30 ? 'High' : 'Medium'),
                        status: days < 0 ? 'Expired' : `Expiring in ${days}d`,
                        date: dateStr,
                        icon: Shield,
                        color: days < 0 ? 'text-red-600' : 'text-amber-600',
                        bg: days < 0 ? 'bg-red-50' : 'bg-amber-50'
                    });
                }
            };
            checkExpiry(p.gasCertificate?.expiryDate, 'Gas Safety');
            checkExpiry(p.eicrCertificate?.expiryDate, 'EICR');
            checkExpiry(p.buildingsInsurance?.renewalDate, 'Insurance');

            // 3. Rent Arrears
            p.tenants.forEach(t => {
                if (!t.isDeleted && !t.isArchived && t.outstandingBalance > 0) {
                    list.push({
                        id: `arrears_${t.id}`,
                        propertyId: p.id,
                        propertyName: address,
                        type: 'financial',
                        title: `Arrears: ${t.name}`,
                        priority: t.outstandingBalance > 500 ? 'High' : 'Medium',
                        status: `£${t.outstandingBalance} Owed`,
                        date: now.toISOString().split('T')[0],
                        icon: Coins,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50'
                    });
                }
            });
        });

        return list.sort((a, b) => {
            const priorityMap: any = { 'Emergency': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityMap[a.priority] - priorityMap[b.priority];
        });
    }, [properties]);

    const stats = useMemo(() => {
        return {
            total: tasks.length,
            maintenance: tasks.filter(t => t.type === 'maintenance').length,
            compliance: tasks.filter(t => t.type === 'compliance').length,
            urgent: tasks.filter(t => t.priority === 'Emergency' || t.priority === 'High').length
        };
    }, [tasks]);

    return (
        <div className="p-8 lg:p-12 w-full mx-auto space-y-10 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Command Center</h2>
                    <p className="text-slate-500 font-medium mt-1">Unified task engine across {properties.length} properties.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {properties.slice(0, 3).map((p, i) => (
                            <img key={i} src={p.imageUrl} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-sm" alt="prop" />
                        ))}
                        {properties.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                +{properties.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: Activity, color: 'text-slate-900' },
                    { label: 'Maintenance', value: stats.maintenance, icon: Wrench, color: 'text-blue-600' },
                    { label: 'Compliance', value: stats.compliance, icon: Shield, color: 'text-amber-600' },
                    { label: 'Urgent Action', value: stats.urgent, icon: AlertCircle, color: 'text-red-600' }
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${s.color.replace('text-', 'bg-').replace('600', '50')} ${s.color}`}>
                            <s.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Unified Feed */}
            <div className="bg-white dark:bg-slate-850 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Feed</h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">All Properties</span>
                        </div>
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-11 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => navigate(`/properties/${task.propertyId}`)}
                            className="p-8 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group flex items-center gap-8"
                        >
                            <div className={`p-5 rounded-[1.5rem] ${task.bg} ${task.color} group-hover:scale-110 transition-transform`}>
                                <task.icon size={28} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${task.priority === 'Emergency' ? 'bg-red-600 text-white' :
                                            task.priority === 'High' ? 'bg-amber-500 text-white' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <MapPin size={12} /> {task.propertyName}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                            </div>

                            <div className="text-right flex items-center gap-8">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className={`text-sm font-bold ${task.status.includes('Expired') ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{task.status}</p>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900">Zero Critical Issues</h4>
                            <p className="text-slate-500 mt-2 font-medium">Your portfolio is currently optimal and compliant.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategy Hub Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <Shield size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        System Hardening
                    </div>
                    <h3 className="text-4xl font-black mb-6 tracking-tighter">Your aggregate compliance score is 92%</h3>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                        The PropFolio AI engine recommends addressing the 2 High-priority EICR renewals in the next 14 days to maintain institutional financing eligibility.
                    </p>
                    <button className="flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-lg hover:bg-blue-50 transition-all">
                        Execute Bulk Renewals <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
