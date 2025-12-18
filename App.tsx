
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { PropertyDetail } from './components/PropertyDetail';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import PropertiesPage from './components/Properties'; // Extracted
import TenantsPage from './components/Tenants'; // Extracted
import DocumentsPage from './components/Documents'; // Extracted
import OnboardingHub from './components/OnboardingHub';
import CommandCenter from './components/CommandCenter';
import GlobalDashboard from './components/GlobalDashboard';
import AIIntelligenceHub from './components/AIIntelligenceHub';
import GlobalSearch from './components/GlobalSearch';
import { ThemeProvider } from './ThemeContext';
import { DataProvider, useData } from './DataContext';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './components/LoginPage';
import { AlertCircle, Download, Loader2 } from 'lucide-react';

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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="animate-spin text-slate-400" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


const AppContent: React.FC = () => {
  const { properties } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300">
      <GlobalSearch />
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`flex-1 min-h-screen transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm lg:blur-none' : ''} lg:ml-64`}>
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><OnboardingHub /></ProtectedRoute>} />
          <Route path="/command" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
          <Route path="/intelligence" element={<ProtectedRoute><GlobalDashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetailWrapper /></ProtectedRoute>} />
          <Route path="/tenants" element={<ProtectedRoute><TenantsPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage mode="property" /></ProtectedRoute>} />
          <Route path="/tenant-documents" element={<ProtectedRoute><DocumentsPage mode="tenant" /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><div className="p-8 lg:p-10 w-full mx-auto animate-fade-in"><AIAssistant properties={properties} /></div></ProtectedRoute>} />
          <Route path="/ocr-hub" element={<ProtectedRoute><AIIntelligenceHub /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
