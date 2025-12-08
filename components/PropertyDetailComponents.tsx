import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, CalendarClock, Edit } from 'lucide-react';

export const getExpiryStyle = (dateStr?: string) => {
    if (!dateStr) return { status: 'Unknown', class: 'bg-slate-100 text-slate-500 border-slate-200', days: null };
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { status: 'Expired', class: 'bg-red-50 text-red-700 border-red-200', days };
    if (days < 90) return { status: 'Expiring Soon', class: 'bg-amber-50 text-amber-700 border-amber-200', days };
    return { status: 'Active', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', days };
};

export const ComplianceItem = ({ label, date, status }: { label: string, date?: string, status?: string }) => {
    const now = new Date();
    let calculatedStatus: 'Valid' | 'Expired' | 'Warning' | 'Missing' = 'Missing';
    let daysRemaining: number | null = null;

    if (date) {
        const expiryDate = new Date(date);
        const diffTime = expiryDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
            calculatedStatus = 'Expired';
        } else if (daysRemaining < 90) {
            calculatedStatus = 'Warning';
        } else {
            calculatedStatus = 'Valid';
        }
    } else if (status) {
        if (status === 'Valid' || status === 'Active') calculatedStatus = 'Valid';
        else if (status === 'Expired') calculatedStatus = 'Expired';
        else if (status === 'Pending') calculatedStatus = 'Warning';
    }

    const styles = {
        Valid: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', subtext: 'text-emerald-600', icon: CheckCircle2, iconColor: 'text-emerald-500' },
        Warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', subtext: 'text-amber-600', icon: AlertTriangle, iconColor: 'text-amber-500' },
        Expired: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', subtext: 'text-red-600', icon: AlertCircle, iconColor: 'text-red-500' },
        Missing: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-500', subtext: 'text-slate-400', icon: AlertCircle, iconColor: 'text-slate-300' }
    };

    const currentStyle = styles[calculatedStatus];
    const Icon = currentStyle.icon;

    return (
        <div className={`p-5 rounded-xl border ${currentStyle.bg} ${currentStyle.border} flex flex-col justify-between h-full shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStyle.text} opacity-90`}>{label}</span>
                <Icon size={24} className={currentStyle.iconColor} />
            </div>
            <div>
                <div className={`text-xl font-bold ${currentStyle.text} mb-1 leading-none`}>
                    {calculatedStatus === 'Missing' ? 'Not Set' : calculatedStatus}
                </div>
                {date ? (
                    <div className={`text-xs ${currentStyle.subtext} flex items-center flex-wrap gap-1.5 mt-2 font-medium`}>
                        <CalendarClock size={14} />
                        <span>{new Date(date).toLocaleDateString()}</span>
                        {daysRemaining !== null && (
                            <span className="font-bold opacity-90 ml-auto bg-white/50 px-1.5 py-0.5 rounded">
                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days left`}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 italic mt-2">No expiry date recorded</div>
                )}
            </div>
        </div>
    );
};

interface SectionCardProps {
    title: string;
    icon: React.ElementType;
    onEdit: () => void;
    children: React.ReactNode;
    className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, onEdit, children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-8 ${className}`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {Icon && <Icon size={20} className="text-slate-500" />} {title}
            </h3>
            <button
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Section"
            >
                <Edit size={18} />
            </button>
        </div>
        {children}
    </div>
);
