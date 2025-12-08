
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyType } from './types';
import { MOCK_PROPERTIES } from './constants';

interface DataContextType {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  // Backup
  lastBackupDate: string | null;
  backupFrequency: string;
  setBackupFrequency: (freq: string) => void;
  performBackup: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Data State ---
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('propfolio_properties');
    return saved ? JSON.parse(saved) : MOCK_PROPERTIES;
  });

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('propfolio_last_backup');
  });

  const [backupFrequency, setBackupFrequency] = useState<string>(() => {
    return localStorage.getItem('propfolio_backup_frequency') || 'Weekly';
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('propfolio_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    if (lastBackupDate) localStorage.setItem('propfolio_last_backup', lastBackupDate);
  }, [lastBackupDate]);

  useEffect(() => {
    localStorage.setItem('propfolio_backup_frequency', backupFrequency);
  }, [backupFrequency]);

  // --- Actions ---
  const addProperty = (property: Property) => {
    setProperties(prev => [...prev, property]);
  };

  const updateProperty = (updatedProp: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const performBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(properties, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `propfolio_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setLastBackupDate(new Date().toISOString());
  };

  return (
    <DataContext.Provider value={{
      properties,
      setProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      lastBackupDate,
      backupFrequency,
      setBackupFrequency,
      performBackup
    }}>
      {children}
    </DataContext.Provider>
  );
};
