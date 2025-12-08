import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, Database, Palette, Check, Moon, Sun, FileSpreadsheet, Clock, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
import { Property, Tenant, PropertyType } from '../types';
import { MOCK_PROPERTIES } from '../constants';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';

const Settings: React.FC = () => {
  const {
    properties,
    setProperties,
    lastBackupDate,
    backupFrequency,
    setBackupFrequency,
    performBackup
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const { currentTheme, setTheme, availableThemes, isDarkMode, toggleDarkMode } = useTheme();

  // --- CSV Logic ---
  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        let field = line.substring(start, i);
        if (field.startsWith('"') && field.endsWith('"')) {
          field = field.slice(1, -1).replace(/""/g, '"');
        }
        result.push(field);
        start = i + 1;
      }
    }
    let lastField = line.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
      lastField = lastField.slice(1, -1).replace(/""/g, '"');
    }
    result.push(lastField);
    return result;
  };

  const handleExportCSV = () => {
    const headers = ['PropertyId', 'Address', 'Postcode', 'Type', 'Owner', 'PurchaseDate', 'Description', 'MortgageLender', 'MortgagePayment', 'MortgageRate', 'MortgageTerm', 'MortgageExpiry', 'MortgageType', 'InsuranceProvider', 'InsurancePolicy', 'InsuranceRenewal', 'InsurancePremium', 'TenantId', 'TenantName', 'RoomId', 'RentAmount', 'DepositAmount', 'StartDate', 'EndDate'];
    let csvContent = headers.join(',') + '\n';
    properties.forEach(p => {
      const pData = [p.id, p.address, p.postcode, p.type, p.owner, p.purchaseDate, p.description, p.mortgage?.lenderName, p.mortgage?.monthlyPayment, p.mortgage?.interestRate, p.mortgage?.termYears, p.mortgage?.fixedRateExpiry, p.mortgage?.type, p.buildingsInsurance?.provider, p.buildingsInsurance?.policyNumber, p.buildingsInsurance?.renewalDate, p.buildingsInsurance?.premium];
      if (p.tenants.length === 0) {
        const emptyTenant = Array(7).fill('');
        csvContent += pData.map(escapeCSV).concat(emptyTenant).join(',') + '\n';
      } else {
        p.tenants.forEach(t => {
          const tData = [t.id, t.name, t.roomId, t.rentAmount, t.depositAmount, t.tenancyStartDate, t.tenancyEndDate];
          csvContent += pData.map(escapeCSV).concat(tData.map(escapeCSV)).join(',') + '\n';
        });
      }
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'propfolio_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) { alert('Invalid CSV'); return; }
      const propertyMap = new Map<string, Property>();
      properties.forEach(p => propertyMap.set(p.id, p));
      const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 5) continue;
        const [pIdRaw, address, postcode, typeRaw, owner, purchaseDate, description, mLender, mPay, mRate, mTerm, mExp, mType, iProv, iPol, iRen, iPrem, tIdRaw, tName, tRoom, tRent, tDep, tStart, tEnd] = cols;
        let pId = pIdRaw;
        if (!pId) {
          const existing = Array.from(propertyMap.values()).find(p => p.address === address);
          if (existing) pId = existing.id; else pId = generateId('prop');
        }
        let property = propertyMap.get(pId);
        if (!property) {
          property = { id: pId, address: address || 'Unknown', postcode: postcode || '', type: (typeRaw as PropertyType) || PropertyType.FLAT, owner: owner, purchaseDate: purchaseDate || new Date().toISOString().split('T')[0], description: description, imageUrl: 'https://picsum.photos/800/600', tenants: [], documents: [], utilities: [], productInsurances: [], transactions: [] };
        } else {
          property = { ...property, address: address || property.address, postcode: postcode || property.postcode, type: (typeRaw as PropertyType) || property.type, owner: owner || property.owner, description: description || property.description, purchaseDate: purchaseDate || property.purchaseDate };
        }
        if (mLender) property.mortgage = { lenderName: mLender, monthlyPayment: Number(mPay) || 0, interestRate: Number(mRate) || 0, termYears: Number(mTerm) || 0, fixedRateExpiry: mExp, type: mType };
        if (iProv) property.buildingsInsurance = { provider: iProv, policyNumber: iPol, renewalDate: iRen, premium: Number(iPrem) || 0 };
        if (tName && tName.trim() !== '') {
          const tId = tIdRaw || generateId('t');
          const existingTenantIndex = property.tenants.findIndex(t => t.id === tId);
          const tenantData: Tenant = { id: tId, name: tName, roomId: tRoom, rentAmount: Number(tRent) || 0, depositAmount: Number(tDep) || 0, tenancyStartDate: tStart, tenancyEndDate: tEnd, depositReference: '', outstandingBalance: 0, payments: [], documents: [] };
          if (existingTenantIndex >= 0) property.tenants[existingTenantIndex] = { ...property.tenants[existingTenantIndex], ...tenantData }; else property.tenants.push(tenantData);
        }
        propertyMap.set(pId, property);
      }
      setProperties(Array.from(propertyMap.values()));
      alert('Imported successfully!');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) { setProperties(parsed); alert('Imported!'); } else { alert('Invalid JSON'); }
      } catch (err) { alert('Failed to parse'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Reset to demo data?')) { setProperties(MOCK_PROPERTIES); localStorage.removeItem('propfolio_properties'); }
  };

  return (
    <div className="p-8 lg:p-10 w-full mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-blue-600" size={32} /> Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your application data, preferences, and backups.</p>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shadow-sm"><Palette size={20} /></div>
              <div><h3 className="text-lg font-bold text-slate-900">Appearance</h3></div>
            </div>
            <button onClick={toggleDarkMode} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out flex items-center justify-center shadow-sm ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}>
                {isDarkMode ? <Moon size={12} className="text-slate-800" /> : <Sun size={14} className="text-amber-500" />}
              </span>
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableThemes.map((theme) => (
                <button key={theme.id} onClick={() => setTheme(theme.id)} className={`group relative flex flex-col text-left p-4 rounded-xl border-2 transition-all ${currentTheme === theme.id ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500' : 'border-slate-100 hover:border-blue-300 hover:shadow-md bg-white'}`}>
                  <div className="flex items-center justify-between mb-3 w-full">
                    <span className="font-bold text-slate-800">{theme.name}</span>
                    {currentTheme === theme.id && (<div className="bg-blue-500 text-white rounded-full p-0.5"><Check size={12} /></div>)}
                  </div>
                  <p className="text-xs text-slate-500">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm"><FileSpreadsheet size={20} /></div>
            <div><h3 className="text-lg font-bold text-slate-900">Spreadsheet Data Management</h3></div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-800 mb-2">Download CSV</h4>
              <p className="text-xs text-slate-500 mb-4">Export all your property and tenant data to a CSV file.</p>
              <button onClick={handleExportCSV} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transform active:scale-[0.98]">
                <Download size={18} /> Download File
              </button>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-800 mb-2">Upload CSV</h4>
              <p className="text-xs text-slate-500 mb-4">Import properties and tenants from a CSV file.</p>
              <label className="w-full py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-[0.98]">
                <Upload size={18} /> Select File
                <input type="file" accept=".csv" ref={csvInputRef} onChange={handleImportCSV} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Backup & Reset */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shadow-sm"><Database size={20} /></div>
            <div><h3 className="text-lg font-bold text-slate-900">Full Backup & Reset</h3></div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-800 mb-2">Export JSON</h4>
              <p className="text-xs text-slate-500 mb-4">Full backup of all application state.</p>
              <button onClick={performBackup} className="text-blue-600 text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                <Download size={14} /> Download Backup
              </button>
            </div>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-800 mb-2">Import JSON</h4>
              <p className="text-xs text-slate-500 mb-4">Restore from a JSON backup file.</p>
              <label className="text-emerald-600 text-sm font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto">
                <Upload size={14} /> Restore Backup
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
            <div className="p-5 bg-red-50 rounded-xl border border-red-100 text-center hover:border-red-200 transition-colors">
              <h4 className="font-bold text-red-900 mb-2">Reset App</h4>
              <p className="text-xs text-red-700/70 mb-4">Clear all data and reset to demo.</p>
              <button onClick={handleReset} className="text-red-600 text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                <RefreshCw size={14} /> Reset to Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
