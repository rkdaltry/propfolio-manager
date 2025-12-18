import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import {
    MapPin,
    Layers,
    Navigation,
    Info,
    TrendingUp,
    ShieldCheck,
    Target,
    Compass,
    Plus,
    Minus,
    Maximize2
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface PortfolioMapProps {
    properties: Property[];
}

const PortfolioMap: React.FC<PortfolioMapProps> = ({ properties }) => {
    const [viewMode, setViewMode] = useState<'standard' | 'heatmap' | 'hotspots'>('standard');
    const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

    const selectedProperty = useMemo(() =>
        properties.find(p => p.id === selectedPropId),
        [properties, selectedPropId]);

    // Calibrated Coordinate to SVG mapping for the UK mainland (Precision v4.0)
    const getPoint = (lat: number, lng: number) => {
        // Precise UK Bounds for the 480x750 viewport
        // Lat: 49.8 (Lizard Point) to 58.7 (John o' Groats)
        // Lng: -6.5 (Land's End-ish) to 1.8 (East Anglia)
        const x = (lng + 7.0) * 45 + 50;
        const y = (59.0 - lat) * 75 + 10;
        return { x, y };
    };

    const CITIES = [
        { name: 'London', lat: 51.5074, lng: -0.1278, growth: 'High', type: 'Investment Hotspot' },
        { name: 'Manchester', lat: 53.4808, lng: -2.2426, growth: 'Stable', type: 'Yield Focus' },
        { name: 'Birmingham', lat: 52.4862, lng: -1.8904, growth: 'High', type: 'Strategic Hub' },
        { name: 'Leeds', lat: 53.8008, lng: -1.5491, growth: 'High', type: 'Growth Area' },
        { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, growth: 'Stable', type: 'Equity Safe' },
        { name: 'Glasgow', lat: 55.8642, lng: -4.2518, growth: 'High', type: 'Urban Growth' },
        { name: 'Bristol', lat: 51.4545, lng: -2.5879, growth: 'High', type: 'Tech Hub' },
        { name: 'Cardiff', lat: 51.4816, lng: -3.1791, growth: 'Stable', type: 'Capital Hub' },
        { name: 'Newcastle', lat: 54.9783, lng: -1.6178, growth: 'Rising', type: 'Yield Play' },
        { name: 'Belfast', lat: 54.5973, lng: -5.9301, growth: 'Stable', type: 'Regional Hub' },
    ];

    return (
        <div className="bg-[#0b0f1a] rounded-[3rem] overflow-hidden border border-slate-800/50 shadow-2xl relative min-h-[700px] flex flex-col group animate-fade-in">
            {/* Map Header Detail */}
            <div className="absolute top-10 left-10 z-20">
                <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl shadow-2xl">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                        <Compass className="text-white animate-spin-slow" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none text-[1.4rem]">Mainland Hub</h3>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">High-Fidelity Geospatial v4.0</p>
                    </div>
                </div>
            </div>

            {/* View Mode Switcher */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    {[
                        { id: 'standard', label: 'Distribution', icon: Layers },
                        { id: 'heatmap', label: 'Yield Heatmap', icon: TrendingUp },
                        { id: 'hotspots', label: 'Investment Hotspots', icon: Target }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as any)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === mode.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/10'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <mode.icon size={16} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend & Stats Overlay */}
            <div className="absolute top-10 right-10 z-20 text-right space-y-4">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-[2rem] shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Live Matrix</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">{properties.length} Active Assets</span>
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">Strategic Locations</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl flex flex-col gap-1 w-fit ml-auto">
                    <button className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Plus size={18} /></button>
                    <button className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Minus size={18} /></button>
                    <button className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border-t border-white/5 mt-1 pt-3"><Maximize2 size={18} /></button>
                </div>
            </div>

            {/* The Map visualization */}
            <div className="flex-1 relative overflow-hidden bg-gradient-radial from-slate-900/50 to-transparent">
                <svg className="w-full h-full" viewBox="0 0 480 750">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <radialGradient id="hotspotGradient">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Highly Characteristic UK Mainland Path (v4.0) */}
                    <path
                        d="M30,680 L70,640 L110,610 L95,580 L75,550 L85,500 L80,450 L100,410 L90,360 L105,320 L130,300 L125,250 L140,210 L130,160 L150,110 L180,80 L220,100 L240,150 L270,220 L260,280 L290,340 L310,400 L340,460 L380,500 L410,530 L390,580 L350,620 L290,660 L200,700 L130,720 L60,710 L30,680 Z"
                        className="fill-[#1a2133] stroke-slate-700/60 stroke-[1.5]"
                    />

                    {/* Ocean Grid Lines */}
                    {[...Array(20)].map((_, i) => (
                        <line key={`v-${i}`} x1={i * 24} y1="0" x2={i * 24} y2="750" className="stroke-white/5 stroke-[0.3]" />
                    ))}
                    {[...Array(30)].map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 25} x2="480" y2={i * 25} className="stroke-white/5 stroke-[0.3]" />
                    ))}

                    {/* Investment Hotspots Layer */}
                    {viewMode === 'hotspots' && CITIES.map(city => {
                        const { x, y } = getPoint(city.lat, city.lng);
                        return (
                            <g key={`hotspot-${city.name}`} className="animate-pulse-slow">
                                <circle cx={x} cy={y} r="40" fill="url(#hotspotGradient)" />
                                <circle cx={x} cy={y} r="20" fill="url(#hotspotGradient)" />
                            </g>
                        );
                    })}

                    {/* City Reference Markers */}
                    {CITIES.map(city => {
                        const { x, y } = getPoint(city.lat, city.lng);
                        return (
                            <g key={city.name} className="group/city">
                                <circle cx={x} cy={y} r="2" className="fill-slate-500/50" />
                                <text x={x + 6} y={y + 3} className={`text-[8px] font-black uppercase tracking-tighter transition-all duration-300 ${viewMode === 'hotspots' ? 'fill-white' : 'fill-slate-600 opacity-40 group-hover/city:opacity-100 group-hover/city:fill-white'}`}>
                                    {city.name}
                                </text>
                                {viewMode === 'hotspots' && (
                                    <text x={x + 6} y={y + 11} className="fill-emerald-400 text-[6px] font-black uppercase tracking-widest">{city.growth} GROWTH</text>
                                )}
                            </g>
                        );
                    })}

                    {/* Portfolio Asset Markers */}
                    {properties.filter(p => p.coordinates).map((p, idx) => {
                        const { x, y } = getPoint(p.coordinates!.lat, p.coordinates!.lng);
                        const isSelected = selectedPropId === p.id;

                        // Small jitter for multiple assets in same area
                        const jX = x + (idx % 3 - 1) * 4;
                        const jY = y + (idx % 2 - 1) * 4;

                        // Yield data for heatmap
                        const annualTotalRent = p.tenants.reduce((s, t) => s + (t.rentAmount * 12), 0);
                        const yieldVal = p.currentValuation ? (annualTotalRent / p.currentValuation) * 100 : 0;

                        let color = '#3b82f6'; // standard
                        if (viewMode === 'heatmap') {
                            color = yieldVal > 6 ? '#10b981' : (yieldVal > 4 ? '#f59e0b' : '#ef4444');
                        }

                        return (
                            <g key={p.id} className="cursor-pointer" onClick={() => setSelectedPropId(p.id)}>
                                {isSelected && (
                                    <circle cx={jX} cy={jY} r="22" className="fill-blue-500/10 animate-ping" />
                                )}

                                {viewMode === 'heatmap' && (
                                    <circle cx={jX} cy={jY} r="15" fill={color} opacity="0.2" filter="url(#glow)" className="animate-pulse" />
                                )}

                                <circle
                                    cx={jX}
                                    cy={jY}
                                    r={isSelected ? 8 : 6}
                                    fill={color}
                                    className="transition-all duration-500"
                                    stroke="#0b0f1a"
                                    strokeWidth={isSelected ? 4 : 2}
                                    filter={isSelected ? "url(#glow)" : "none"}
                                />

                                {isSelected && (
                                    <g transform={`translate(${jX + 15}, ${jY - 12})`}>
                                        <rect width="90" height="24" rx="8" className="fill-slate-900/90 shadow-2xl backdrop-blur-xl" />
                                        <text x="10" y="16" className="fill-white text-[10px] font-black uppercase tracking-tight">
                                            {p.address.split(',')[0]}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Asset Detail Mini-Panel (Modern UI) */}
            {selectedProperty && (
                <div className="absolute bottom-12 left-12 right-12 z-30 animate-slide-up">
                    <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
                        <div className="relative shrink-0">
                            <img
                                src={selectedProperty.imageUrl}
                                className="w-32 h-32 rounded-3xl object-cover border-2 border-white/5 ring-4 ring-blue-600/10 transition-transform group-hover:scale-105"
                                alt="asset"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-xl ring-4 ring-slate-900">
                                <Navigation size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-3xl font-black text-white truncate uppercase italic tracking-tighter">{selectedProperty.address}</h4>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <MapPin size={12} className="text-blue-500" /> {selectedProperty.postcode} • {selectedProperty.owner}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 mt-6">
                                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2.5">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Compliance Secure</span>
                                </div>
                                {selectedProperty.currentValuation && (
                                    <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2.5">
                                        <TrendingUp size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {((selectedProperty.tenants.reduce((s, t) => s + t.rentAmount, 0) * 12) / selectedProperty.currentValuation * 100).toFixed(1)}% Yield
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 pl-8 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-50">Market Value</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(selectedProperty.currentValuation || 0)}</p>
                            </div>
                            <button className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
                                Open Analytics Hub
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interaction Prompt */}
            {!selectedPropId && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full border border-white/20 animate-ping" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Interactive Matrix Active</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioMap;
