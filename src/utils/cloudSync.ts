import type { AppState, CloudSyncConfig } from '../types';

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';

export interface SyncResult {
  success: boolean;
  data?: AppState;
  error?: string;
  lastSyncAt?: string;
}

export interface CloudSyncService {
  testConnection(config: CloudSyncConfig): Promise<SyncResult>;
  pushData(config: CloudSyncConfig, data: AppState): Promise<SyncResult>;
  pullData(config: CloudSyncConfig): Promise<SyncResult>;
}

function getJsonBinHeaders(config: CloudSyncConfig): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Master-Key': config.jsonbin?.apiKey || '',
  };
  return headers;
}

function getJsonBinUrl(config: CloudSyncConfig): string {
  const binId = config.jsonbin?.binId;
  if (!binId) throw new Error('Bin ID not configured');
  return `${JSONBIN_BASE_URL}/${binId}`;
}

export const jsonBinSyncService: CloudSyncService = {
  async testConnection(config: CloudSyncConfig): Promise<SyncResult> {
    if (!config.jsonbin?.binId || !config.jsonbin?.apiKey) {
      return { success: false, error: 'JSONBin not configured' };
    }

    try {
      const response = await fetch(getJsonBinUrl(config), {
        method: 'GET',
        headers: getJsonBinHeaders(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: `Connection failed: ${response.status} - ${errorData.message || 'Unknown error'}` 
        };
      }

      return { success: true, lastSyncAt: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  },

  async pushData(config: CloudSyncConfig, data: AppState): Promise<SyncResult> {
    if (!config.jsonbin?.binId || !config.jsonbin?.apiKey) {
      return { success: false, error: 'JSONBin not configured' };
    }

    try {
      const payload = {
        _version: 1,
        data,
      };

      const response = await fetch(getJsonBinUrl(config), {
        method: 'PUT',
        headers: getJsonBinHeaders(config),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: `Push failed: ${response.status} - ${errorData.message || 'Unknown error'}` 
        };
      }

      return { success: true, lastSyncAt: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Push failed' };
    }
  },

  async pullData(config: CloudSyncConfig): Promise<SyncResult> {
    if (!config.jsonbin?.binId || !config.jsonbin?.apiKey) {
      return { success: false, error: 'JSONBin not configured' };
    }

    try {
      const response = await fetch(getJsonBinUrl(config), {
        method: 'GET',
        headers: getJsonBinHeaders(config),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Bin not found (404)' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: `Pull failed: ${response.status} - ${errorData.message || 'Unknown error'}` 
        };
      }

      const result = await response.json();
      const remoteData = result.record?.data || result.data;
      
      if (!remoteData || !Array.isArray(remoteData.materials) || !Array.isArray(remoteData.products)) {
        return { success: false, error: 'Invalid data format in remote storage' };
      }

      return { 
        success: true, 
        data: remoteData as AppState,
        lastSyncAt: new Date().toISOString() 
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Pull failed' };
    }
  },
};

export function mergeStates(
  local: AppState,
  remote: AppState,
  strategy: 'local-wins' | 'remote-wins' | 'manual' = 'remote-wins'
): { merged: AppState; conflicts: string[] } {
  const conflicts: string[] = [];

  if (strategy === 'local-wins') {
    return { merged: local, conflicts: [] };
  }

  if (strategy === 'remote-wins') {
    return { merged: remote, conflicts: [] };
  }

  // Manual strategy - for now default to remote, but track conflicts
  // In a full implementation, this would show a UI to resolve conflicts
  const merged = { ...remote };
  
  // Check for potential conflicts (simplified)
  if (local.materials.length !== remote.materials.length) {
    conflicts.push(`Material count differs: local=${local.materials.length}, remote=${remote.materials.length}`);
  }
  if (local.products.length !== remote.products.length) {
    conflicts.push(`Product count differs: local=${local.products.length}, remote=${remote.products.length}`);
  }

  return { merged, conflicts };
}