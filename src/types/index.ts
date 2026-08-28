export type MaterialCategory = 
  | 'PIPECLEANER' 
  | 'BEAD' 
  | 'PEARL' 
  | 'WIRE' 
  | 'TAPE' 
  | 'GLUE' 
  | 'OTHER';

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string; icon: string }[] = [
  { value: 'PIPECLEANER', label: 'Pipe Cleaner', icon: '🧶' },
  { value: 'BEAD', label: 'Beads', icon: '⚪' },
  { value: 'PEARL', label: 'Pearls', icon: '🤍' },
  { value: 'WIRE', label: 'Floral Wire', icon: '🔗' },
  { value: 'TAPE', label: 'Green Tape', icon: '🟢' },
  { value: 'GLUE', label: 'Hot Glue', icon: '🔫' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  bulkQuantity: number;
  bulkCost: number;
  costPerUnit: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMaterial {
  materialId: string;
  quantity: number;
  // Resolved at calculation time
  materialName?: string;
  unit?: string;
  costPerUnit?: number;
  lineTotal?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  photo?: string; // base64 data URL
  materials: ProductMaterial[];
  laborHours: number;
  hourlyRate: number;
  markupPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  subtotal: number;
  markupAmount: number;
  totalPrice: number;
  materials: ProductMaterial[];
}

export interface AppSettings {
  defaultHourlyRate: number;
  defaultMarkupPercent: number;
  currency: 'AUD';
}

// Cloud Sync Configuration
export interface CloudSyncConfig {
  enabled: boolean;
  provider: 'jsonbin' | 'gist';
  jsonbin?: {
    binId: string;
    apiKey: string;
  };
  gist?: {
    gistId: string;
    token: string;
  };
  autoSync: boolean;
  lastSyncAt?: string;
  conflictStrategy: 'local-wins' | 'remote-wins' | 'manual';
  encryptionPassphrase?: string; // Optional passphrase for client-side AES-GCM encryption
}

export interface AppState {
  materials: Material[];
  products: Product[];
  settings: AppSettings;
  lastOpenedProductId?: string;
  cloudSync: CloudSyncConfig;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultHourlyRate: 25,
  defaultMarkupPercent: 50,
  currency: 'AUD',
};

export const DEFAULT_CLOUD_SYNC: CloudSyncConfig = {
  enabled: false,
  provider: 'jsonbin',
  autoSync: false,
  conflictStrategy: 'remote-wins',
};

export const STORAGE_KEY = 'product-cost-estimator:v1';
export const STORAGE_VERSION = 1;