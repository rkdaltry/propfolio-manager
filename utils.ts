import { Property, Document } from './types';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0
    }).format(amount);
};

export const handleOpenDocument = (doc: Document) => {
    if (!doc.url) return;
    if (doc.url.startsWith('data:')) {
        try {
            const arr = doc.url.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } catch (e) {
            console.error("Failed to open document", e);
            window.open(doc.url, '_blank');
        }
    } else {
        window.open(doc.url, '_blank');
    }
};

export const calculateCompletion = (p: Property) => {
    let score = 0;
    let total = 7;

    const activeTenants = p.tenants.filter(t => !t.isDeleted);
    if (activeTenants.length > 0) score++;

    if (p.mortgage) score++;
    if (p.buildingsInsurance) score++;
    if (p.utilities.length > 0) score++;
    if (p.gasCertificate) score++;
    if (p.eicrCertificate) score++;
    if (p.documents.length > 0) score++;

    return Math.round((score / total) * 100);
};

export const getComplianceStatus = (p: Property) => {
    const certs = [p.gasCertificate, p.eicrCertificate, p.epcCertificate];
    let hasExpired = false;
    let missing = 0;

    certs.forEach(c => {
        if (!c) {
            missing++;
        } else if (c.status === 'Expired' || (c.expiryDate && new Date(c.expiryDate) < new Date())) {
            hasExpired = true;
        }
    });

    if (hasExpired) return { label: 'Attention', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' };
    if (missing === 3) return { label: 'Unknown', icon: ShieldQuestion, color: 'text-purple-500', bg: 'bg-purple-50' };
    if (missing > 0) return { label: 'Incomplete', icon: ShieldQuestion, color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Compliant', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' };
};

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
