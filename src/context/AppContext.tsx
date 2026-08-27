import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  AppState,
  Material,
  Product,
  ProductMaterial,
  AppSettings,
  CloudSyncConfig,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_CLOUD_SYNC,
  STORAGE_KEY,
  STORAGE_VERSION,
} from '../types';
import {
  createMaterialWithCostPerUnit,
  updateMaterialCostPerUnit,
  calculateTotalPrice,
  resolveProductMaterials,
} from '../utils/calculations';
import { generateId } from '../utils/id';
import { jsonBinSyncService, type SyncResult } from '../utils/cloudSync';

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_MATERIAL'; payload: Omit<Material, 'id' | 'costPerUnit' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'DELETE_MATERIAL'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LAST_OPENED_PRODUCT'; payload: string | undefined }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_CLOUD_SYNC'; payload: Partial<CloudSyncConfig> }
  | { type: 'SET_SYNC_STATUS'; payload: { syncing: boolean; lastSyncAt?: string; error?: string } };

const initialState: AppState = {
  materials: [],
  products: [],
  settings: DEFAULT_SETTINGS,
  lastOpenedProductId: undefined,
  cloudSync: DEFAULT_CLOUD_SYNC,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      return action.payload;
    }
    
    case 'ADD_MATERIAL': {
      const newMaterial = createMaterialWithCostPerUnit({
        ...action.payload,
        id: generateId(),
      });
      return {
        ...state,
        materials: [...state.materials, newMaterial],
      };
    }
    
    case 'UPDATE_MATERIAL': {
      const updatedMaterial = updateMaterialCostPerUnit(action.payload);
      return {
        ...state,
        materials: state.materials.map(m =>
          m.id === updatedMaterial.id ? updatedMaterial : m
        ),
        // Also update any products that reference this material (they'll be resolved at calc time)
      };
    }
    
    case 'DELETE_MATERIAL': {
      return {
        ...state,
        materials: state.materials.filter(m => m.id !== action.payload),
        products: state.products.map(product => ({
          ...product,
          materials: product.materials.filter(pm => pm.materialId !== action.payload),
        })),
      };
    }
    
    case 'ADD_PRODUCT': {
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        products: [...state.products, newProduct],
        lastOpenedProductId: newProduct.id,
      };
    }
    
    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : p
        ),
        lastOpenedProductId: action.payload.id,
      };
    }
    
    case 'DELETE_PRODUCT': {
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        lastOpenedProductId:
          state.lastOpenedProductId === action.payload ? undefined : state.lastOpenedProductId,
      };
    }
    
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }
    
    case 'SET_LAST_OPENED_PRODUCT': {
      return {
        ...state,
        lastOpenedProductId: action.payload,
      };
    }
    
    case 'RESET_STATE': {
      return initialState;
    }
    
    case 'UPDATE_CLOUD_SYNC': {
      return {
        ...state,
        cloudSync: { ...state.cloudSync, ...action.payload },
      };
    }
    
    case 'SET_SYNC_STATUS': {
      return {
        ...state,
        cloudSync: {
          ...state.cloudSync,
          lastSyncAt: action.payload.lastSyncAt ?? state.cloudSync.lastSyncAt,
        },
      };
    }
    
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience methods
  addMaterial: (material: Omit<Material, 'id' | 'costPerUnit' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLastOpenedProduct: (id: string | undefined) => void;
  calculateCost: (materials: ProductMaterial[], laborHours: number, hourlyRate: number, markupPercent: number) => {
    materialCost: number;
    laborCost: number;
    subtotal: number;
    markupAmount: number;
    totalPrice: number;
    materials: ProductMaterial[];
  };
  getMaterialById: (id: string) => Material | undefined;
  getProductById: (id: string) => Product | undefined;
  exportData: () => string;
  importData: (json: string) => boolean;
  // Granular export/import
  exportMaterials: () => string;
  exportProducts: () => string;
  importMaterials: (json: string) => boolean;
  importProducts: (json: string) => boolean;
  // Cloud sync methods
  updateCloudSync: (config: Partial<CloudSyncConfig>) => void;
  testConnection: () => Promise<SyncResult>;
  syncNow: () => Promise<SyncResult>;
  enableAutoSync: (enabled: boolean) => void;
  setConflictStrategy: (strategy: 'local-wins' | 'remote-wins' | 'manual') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle both old format (direct state) and new format (with _version)
        const data = parsed._version ? parsed.data : parsed;
        if (data && typeof data === 'object') {
          dispatch({ type: 'LOAD_STATE', payload: data as AppState });
        }
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }, []);
  
  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        _version: STORAGE_VERSION,
        data: state,
      }));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  // Auto-sync to cloud when enabled and state changes
  useEffect(() => {
    if (state.cloudSync.enabled && state.cloudSync.autoSync && state.cloudSync.jsonbin?.binId && state.cloudSync.jsonbin?.apiKey) {
      // Debounce sync to avoid excessive API calls
      const timeoutId = setTimeout(async () => {
        try {
          const result = await jsonBinSyncService.pushData(state.cloudSync, {
            materials: state.materials,
            products: state.products,
            settings: state.settings,
            lastOpenedProductId: state.lastOpenedProductId,
            cloudSync: { ...state.cloudSync, lastSyncAt: new Date().toISOString() },
          });

          if (result.success) {
            dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncAt: new Date().toISOString() } });
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [state.materials, state.products, state.settings, state.lastOpenedProductId, state.cloudSync.enabled, state.cloudSync.autoSync]);
  
  const addMaterial = (material: Omit<Material, 'id' | 'costPerUnit' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_MATERIAL', payload: material });
  };
  
  const updateMaterial = (material: Material) => {
    dispatch({ type: 'UPDATE_MATERIAL', payload: material });
  };
  
  const deleteMaterial = (id: string) => {
    dispatch({ type: 'DELETE_MATERIAL', payload: id });
  };
  
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };
  
  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };
  
  const deleteProduct = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };
  
  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };
  
  const setLastOpenedProduct = (id: string | undefined) => {
    dispatch({ type: 'SET_LAST_OPENED_PRODUCT', payload: id });
  };
  
  const calculateCost = (
    materials: ProductMaterial[],
    laborHours: number,
    hourlyRate: number,
    markupPercent: number
  ) => {
    const resolvedMaterials = resolveProductMaterials(materials, state.materials);
    return calculateTotalPrice(resolvedMaterials, laborHours, hourlyRate, markupPercent);
  };
  
  const getMaterialById = (id: string): Material | undefined => {
    return state.materials.find(m => m.id === id);
  };
  
  const getProductById = (id: string): Product | undefined => {
    return state.products.find(p => p.id === id);
  };
  
  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };
  
  const importData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      // Validate basic structure
      if (
        parsed &&
        Array.isArray(parsed.materials) &&
        Array.isArray(parsed.products) &&
        parsed.settings
      ) {
        dispatch({ type: 'LOAD_STATE', payload: parsed as AppState });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Granular export/import methods
  const exportMaterials = (): string => {
    return JSON.stringify(state.materials, null, 2);
  };

  const exportProducts = (): string => {
    return JSON.stringify(state.products, null, 2);
  };

  const importMaterials = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        // Validate each material has required fields
        const validMaterials = parsed.every(m =>
          m && typeof m === 'object' &&
          typeof m.id === 'string' &&
          typeof m.name === 'string' &&
          typeof m.category === 'string' &&
          typeof m.unit === 'string' &&
          typeof m.bulkQuantity === 'number' &&
          typeof m.bulkCost === 'number' &&
          typeof m.costPerUnit === 'number' &&
          typeof m.createdAt === 'string' &&
          typeof m.updatedAt === 'string'
        );
        if (validMaterials) {
          // Update existing materials or add new ones
          parsed.forEach((material: Material) => {
            const existingIndex = state.materials.findIndex(m => m.id === material.id);
            if (existingIndex >= 0) {
              dispatch({ type: 'UPDATE_MATERIAL', payload: material });
            } else {
              dispatch({ type: 'ADD_MATERIAL', payload: {
                name: material.name,
                category: material.category as any,
                unit: material.unit,
                bulkQuantity: material.bulkQuantity,
                bulkCost: material.bulkCost,
                supplier: material.supplier,
                notes: material.notes,
              }});
            }
          });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const importProducts = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        // Validate each product has required fields
        const validProducts = parsed.every(p =>
          p && typeof p === 'object' &&
          typeof p.id === 'string' &&
          typeof p.name === 'string' &&
          Array.isArray(p.materials) &&
          typeof p.laborHours === 'number' &&
          typeof p.hourlyRate === 'number' &&
          typeof p.markupPercent === 'number' &&
          typeof p.createdAt === 'string' &&
          typeof p.updatedAt === 'string'
        );
        if (validProducts) {
          parsed.forEach((product: Product) => {
            const existingIndex = state.products.findIndex(p => p.id === product.id);
            if (existingIndex >= 0) {
              dispatch({ type: 'UPDATE_PRODUCT', payload: product });
            } else {
              dispatch({ type: 'ADD_PRODUCT', payload: {
                name: product.name,
                description: product.description,
                photo: product.photo,
                materials: product.materials,
                laborHours: product.laborHours,
                hourlyRate: product.hourlyRate,
                markupPercent: product.markupPercent,
              }});
            }
          });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Cloud sync methods
  const updateCloudSync = (config: Partial<CloudSyncConfig>) => {
    dispatch({ type: 'UPDATE_CLOUD_SYNC', payload: config });
  };

  const testConnection = async (): Promise<SyncResult> => {
    const { cloudSync } = state;
    if (!cloudSync.enabled || !cloudSync.jsonbin?.binId || !cloudSync.jsonbin?.apiKey) {
      return { success: false, error: 'Cloud sync not configured' };
    }
    return jsonBinSyncService.testConnection(cloudSync);
  };

  const syncNow = async (): Promise<SyncResult> => {
    const { cloudSync } = state;
    if (!cloudSync.enabled || !cloudSync.jsonbin?.binId || !cloudSync.jsonbin?.apiKey) {
      return { success: false, error: 'Cloud sync not configured' };
    }

    try {
      // Push local data to remote
      const pushResult = await jsonBinSyncService.pushData(cloudSync, {
        materials: state.materials,
        products: state.products,
        settings: state.settings,
        lastOpenedProductId: state.lastOpenedProductId,
        cloudSync: { ...cloudSync, lastSyncAt: new Date().toISOString() },
      });

      if (!pushResult.success) {
        return pushResult;
      }

      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncAt: new Date().toISOString() } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    }
  };

  const enableAutoSync = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_CLOUD_SYNC', payload: { autoSync: enabled } });
  };

  const setConflictStrategy = (strategy: 'local-wins' | 'remote-wins' | 'manual') => {
    dispatch({ type: 'UPDATE_CLOUD_SYNC', payload: { conflictStrategy: strategy } });
  };

  const value: AppContextValue = {
    state,
    dispatch,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    setLastOpenedProduct,
    calculateCost,
    getMaterialById,
    getProductById,
    exportData,
    importData,
    // Granular export/import
    exportMaterials,
    exportProducts,
    importMaterials,
    importProducts,
    // Cloud sync methods
    updateCloudSync,
    testConnection,
    syncNow,
    enableAutoSync,
    setConflictStrategy,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}