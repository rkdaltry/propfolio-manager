
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { PropertyDetail } from './components/PropertyDetail';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import PropertiesPage from './components/Properties'; // Extracted
import TenantsPage from './components/Tenants'; // Extracted
import DocumentsPage from './components/Documents'; // Extracted
import { ThemeProvider } from './ThemeContext';
import { DataProvider, useData } from './DataContext';
import { AlertCircle, Download } from 'lucide-react';

// Helper component for Property Detail Wrapper to use Params
import { useParams, useNavigate } from 'react-router-dom';

const PropertyDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, updateProperty } = useData();
  const property = properties.find(p => p.id === id);

  if (!property) return <div className="p-12 text-center text-lg text-slate-500">Property not found</div>;

  return (
    <div className="p-8 lg:p-10 w-full mx-auto">
      <PropertyDetail
        property={property}
        onBack={() => navigate(-1)}
        onUpdateProperty={updateProperty}
      />
    </div>
  );
};

const BackupBanner: React.FC = () => {
  const { lastBackupDate, backupFrequency, performBackup } = useData();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (backupFrequency === 'Never') {
      setVisible(false);
      return;
    }
    const now = new Date();
    const last = lastBackupDate ? new Date(lastBackupDate) : new Date(0);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let limit = 7;
    if (backupFrequency === 'Daily') limit = 1;
    if (backupFrequency === 'Monthly') limit = 30;

    setVisible(diffDays > limit);
  }, [lastBackupDate, backupFrequency]);

  if (!visible) return null;

  return (
    <div className="bg-indigo-600 text-white px-6 py-3 flex justify-between items-center shadow-md animate-fade-in z-10">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="text-indigo-200" />
        <p className="text-sm font-medium">
          <span className="font-bold">Backup Due:</span> It has been over {backupFrequency.toLowerCase()} since your last backup.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setVisible(false)} className="text-indigo-200 hover:text-white text-xs underline">Dismiss</button>
        <button onClick={performBackup} className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"><Download size={14} /> Download Backup</button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { properties } = useData(); // Access global data for AI Assistant prop
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <BackupBanner />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailWrapper />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/documents" element={<DocumentsPage mode="property" />} />
          <Route path="/tenant-documents" element={<DocumentsPage mode="tenant" />} />
          <Route path="/assistant" element={<div className="p-8 lg:p-10 w-full mx-auto animate-fade-in"><AIAssistant properties={properties} /></div>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;
