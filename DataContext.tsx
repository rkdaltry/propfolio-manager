
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Property, PropertyType } from './types';
import { DEMO_PROPERTIES } from './constants';
import { useAuth } from './AuthContext';
import { saveProperty, deletePropertyFromFirestore, subscribeToProperties } from './services/propertyService';

interface DataContextType {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  restoreProperty: (id: string) => void;
  permanentlyDeleteProperty: (id: string) => void;
  // Backup
  lastBackupDate: string | null;
  backupFrequency: string;
  setBackupFrequency: (freq: string) => void;
  performBackup: () => void;
  isLoading: boolean;
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Track properties being saved to prevent race conditions
  const pendingSavesRef = useRef<Set<string>>(new Set());

  // --- Data State ---
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('propfolio_properties');
    return saved ? JSON.parse(saved) : DEMO_PROPERTIES;
  });

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('propfolio_last_backup');
  });

  const [backupFrequency, setBackupFrequency] = useState<string>(() => {
    return localStorage.getItem('propfolio_backup_frequency') || 'Weekly';
  });

  // --- Firestore Sync ---
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToProperties(user.uid, (cloudProps) => {
      console.log('[DataContext] Received cloud properties:', cloudProps.length);

      if (cloudProps.length > 0) {
        // MERGE cloud data with local state instead of overwriting
        setProperties(prevLocal => {
          // Get IDs of properties currently being saved (to avoid overwriting them)
          const pendingIds = pendingSavesRef.current;

          // Create a map of cloud properties by ID
          const cloudMap = new Map(cloudProps.map(p => [p.id, p]));

          // Keep local properties that are pending save or not in cloud yet
          const localOnlyProps = prevLocal.filter(p =>
            pendingIds.has(p.id) || !cloudMap.has(p.id)
          );

          // Merge: cloud properties + local-only properties
          const mergedProps = [...cloudProps, ...localOnlyProps];

          // Deduplicate by ID (prefer cloud version if both exist and not pending)
          const uniqueMap = new Map<string, Property>();
          mergedProps.forEach(p => {
            if (!uniqueMap.has(p.id) || pendingIds.has(p.id)) {
              uniqueMap.set(p.id, p);
            }
          });

          console.log('[DataContext] Merged properties:', uniqueMap.size);
          return Array.from(uniqueMap.values());
        });
      } else {
        // If logged in but no cloud data, save all current properties to cloud
        console.log('[DataContext] No cloud data, syncing local properties to Firestore');
        properties.forEach(prop => {
          pendingSavesRef.current.add(prop.id);
          saveProperty(user.uid, prop).finally(() => {
            pendingSavesRef.current.delete(prop.id);
          });
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


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
  const addProperty = async (property: Property) => {
    console.log('[DataContext] Adding property:', property.address, property.id);

    // Add to local state FIRST for instant UI feedback
    setProperties(prev => [...prev, property]);

    // Then save to Firestore (if logged in)
    if (user) {
      // Track this property as pending to prevent sync from overwriting it
      pendingSavesRef.current.add(property.id);

      try {
        await saveProperty(user.uid, property);
        console.log('[DataContext] Property saved to Firestore successfully');
      } catch (error) {
        console.error('[DataContext] Failed to save property to Firestore:', error);
      } finally {
        // Remove from pending after save completes (success or failure)
        pendingSavesRef.current.delete(property.id);
      }
    }
  };


  const updateProperty = async (updatedProp: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    if (user) await saveProperty(user.uid, updatedProp);
  };

  const deleteProperty = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    const updatedProp = { ...property, isDeleted: true, deletedAt: new Date().toISOString() };
    setProperties(prev => prev.map(p => p.id === id ? updatedProp : p));
    if (user) await saveProperty(user.uid, updatedProp);
  };

  const restoreProperty = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    const updatedProp = { ...property, isDeleted: false, deletedAt: undefined };
    setProperties(prev => prev.map(p => p.id === id ? updatedProp : p));
    if (user) await saveProperty(user.uid, updatedProp);
  };

  const permanentlyDeleteProperty = async (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    if (user) await deletePropertyFromFirestore(id);
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
      restoreProperty,
      permanentlyDeleteProperty,
      lastBackupDate,
      backupFrequency,
      setBackupFrequency,
      performBackup,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};
