import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    Settings,
    Bot,
    LogOut,
    ChevronRight,
    Plus,
    Search,
    Bell,
    Menu,
    Activity,
    Shield,
    TrendingUp,
    Sparkles
} from 'lucide-react';

export const COLORS = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
};

export const SHADOWS = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

export const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Command Center', path: '/command', icon: Shield },
    { label: 'Portfolio Intel', path: '/intelligence', icon: Activity },
    { label: 'Add New', path: '/add', icon: Plus },
    { label: 'Properties', path: '/properties', icon: Building2 },
    { label: 'Tenants', path: '/tenants', icon: Users },
    { label: 'Property Docs', path: '/documents', icon: FileText },
    { label: 'Tenant Docs', path: '/tenant-documents', icon: FileText },
    { label: 'AI Assistant', path: '/assistant', icon: Bot },
    { label: 'AI Intellect', path: '/ocr-hub', icon: Sparkles },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export const TRANSITIONS = {
    default: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
};
