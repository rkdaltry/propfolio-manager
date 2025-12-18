import React, { useState } from 'react';
import { Property, MaintenanceTicket, MaintenanceStatus } from '../types';
import { Wrench, Plus, Clock, CheckCircle2, AlertCircle, X, Hammer, Droplets, Zap, Shield, Trash2, ChevronRight, Archive, Sparkles } from 'lucide-react';

interface MaintenanceSectionProps {
    property: Property;
    onUpdateProperty: (property: Property) => void;
}

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ property, onUpdateProperty }) => {
    const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
        property.maintenanceTickets && property.maintenanceTickets.length > 0 ? property.maintenanceTickets[0].id : null
    );
    const [newTicket, setNewTicket] = useState<Partial<MaintenanceTicket>>({
        title: '',
        description: '',
        status: MaintenanceStatus.REPORTED,
        priority: 'Medium',
        category: 'Other',
        reportedDate: new Date().toISOString().split('T')[0]
    });

    const maintenanceTickets = property.maintenanceTickets || [];
    const activeTicket = maintenanceTickets.find(t => t.id === selectedTicketId);

    const handleAddTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const ticket: MaintenanceTicket = {
            id: `mt_${Date.now()}`,
            title: newTicket.title || 'Untitled Ticket',
            description: newTicket.description || '',
            status: newTicket.status as MaintenanceStatus || MaintenanceStatus.REPORTED,
            priority: newTicket.priority as any || 'Medium',
            reportedDate: newTicket.reportedDate || new Date().toISOString().split('T')[0],
            category: newTicket.category as any || 'Other'
        };

        onUpdateProperty({
            ...property,
            maintenanceTickets: [ticket, ...maintenanceTickets]
        });

        setIsAddTicketOpen(false);
        setNewTicket({
            title: '',
            description: '',
            status: MaintenanceStatus.REPORTED,
            priority: 'Medium',
            category: 'Other',
            reportedDate: new Date().toISOString().split('T')[0]
        });
        setSelectedTicketId(ticket.id);
    };

    const handleUpdateTicketStatus = (ticketId: string, status: MaintenanceStatus) => {
        const updatedTickets = maintenanceTickets.map(t =>
            t.id === ticketId ? { ...t, status, resolvedDate: status === MaintenanceStatus.RESOLVED ? new Date().toISOString().split('T')[0] : t.resolvedDate } : t
        );
        onUpdateProperty({ ...property, maintenanceTickets: updatedTickets });
    };

    const handleDeleteTicket = (ticketId: string) => {
        const updatedTickets = maintenanceTickets.filter(t => t.id !== ticketId);
        onUpdateProperty({ ...property, maintenanceTickets: updatedTickets });
        if (selectedTicketId === ticketId) {
            setSelectedTicketId(updatedTickets.length > 0 ? updatedTickets[0].id : null);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Emergency': return 'text-red-600 bg-red-100 border-red-200';
            case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'Medium': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'Low': return 'text-slate-600 bg-slate-100 border-slate-200';
            default: return 'text-slate-600 bg-slate-100 border-slate-200';
        }
    };

    const getStatusIcon = (status: MaintenanceStatus) => {
        switch (status) {
            case MaintenanceStatus.REPORTED: return <Clock size={16} className="text-orange-500" />;
            case MaintenanceStatus.IN_PROGRESS: return <Wrench size={16} className="text-blue-500 animate-pulse" />;
            case MaintenanceStatus.RESOLVED: return <CheckCircle2 size={16} className="text-emerald-500" />;
            case MaintenanceStatus.CANCELLED: return <X size={16} className="text-slate-400" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Plumbing': return <Droplets size={20} />;
            case 'Electrical': return <Zap size={20} />;
            case 'Structural': return <Hammer size={20} />;
            case 'Appliance': return <Hammer size={20} />;
            case 'Cleaning': return <Shield size={20} />;
            default: return <Wrench size={20} />;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in min-h-[500px]">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Wrench size={24} className="text-blue-600" />
                    Maintenance Tracker
                </h3>
                <button
                    onClick={() => setIsAddTicketOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <Plus size={18} /> New Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Ticket List */}
                <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/30">
                    <div className="p-4 space-y-2">
                        {maintenanceTickets.length === 0 ? (
                            <div className="p-12 text-center">
                                <Wrench size={40} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold text-sm">No maintenance tickets reported.</p>
                            </div>
                        ) : (
                            maintenanceTickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${selectedTicketId === ticket.id ? 'bg-white shadow-xl shadow-slate-100 border border-slate-100 scale-[1.02] ring-1 ring-blue-500/20' : 'hover:bg-white border border-transparent'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${selectedTicketId === ticket.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                            {getCategoryIcon(ticket.category)}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm ${selectedTicketId === ticket.id ? 'text-slate-900' : 'text-slate-600'}`}>{ticket.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className={`transition-transform ${selectedTicketId === ticket.id ? 'text-blue-500 translate-x-1' : 'text-slate-300'}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Ticket Details */}
                <div className="lg:col-span-8 bg-white p-8">
                    {activeTicket ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">{activeTicket.title}</h2>
                                    <p className="text-slate-500 font-medium">Reported on {new Date(activeTicket.reportedDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteTicket(activeTicket.id)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                        title="Delete Ticket"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                                        {getStatusIcon(activeTicket.status)}
                                        {activeTicket.status}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider inline-block ${getPriorityColor(activeTicket.priority)}`}>
                                        {activeTicket.priority}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</p>
                                    <p className="text-sm font-black text-slate-900 capitalize">{activeTicket.category}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Est. Cost</p>
                                    <p className="text-sm font-black text-slate-900">£{activeTicket.cost || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</p>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-slate-600 font-medium leading-relaxed">{activeTicket.description || 'No description provided.'}</p>
                                </div>
                            </div>

                            {/* Status Update Controls */}
                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={20} className="text-blue-500" />
                                    <p className="font-bold text-blue-900 text-sm">Update processing status</p>
                                </div>
                                <div className="flex gap-2">
                                    {Object.values(MaintenanceStatus).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateTicketStatus(activeTicket.id, status)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTicket.status === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-white/80 border border-slate-100'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <Wrench size={60} className="text-slate-200 mb-6" />
                            <h4 className="text-xl font-black text-slate-400">Select a Ticket</h4>
                            <p className="text-slate-400 font-medium max-w-[250px] mt-2">Choose a maintenance issue from the list to view full details and manage its status.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Ticket Modal */}
            {isAddTicketOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Hammer size={24} className="text-blue-600" />
                                Raise Ticket
                            </h3>
                            <button onClick={() => setIsAddTicketOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X size={28} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAddTicket} className="flex-1 overflow-y-auto p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Issue Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Leaking kitchen tap"
                                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    value={newTicket.title}
                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        value={newTicket.category}
                                        onChange={e => setNewTicket({ ...newTicket, category: e.target.value as any })}
                                    >
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                        <option>Structural</option>
                                        <option>Appliance</option>
                                        <option>Cleaning</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                                    <select
                                        className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    rows={4}
                                    placeholder="Describe the issue in detail..."
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reported on</label>
                                <input
                                    type="date"
                                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    value={newTicket.reportedDate}
                                    onChange={e => setNewTicket({ ...newTicket, reportedDate: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4">
                                Log Maintenance Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceSection;
