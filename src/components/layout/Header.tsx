import React from 'react';
import { Settings, Download, Upload, FileText, Cloud, CloudCheck, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';

export const Header: React.FC = () => {
  const { state, exportData, importData, updateSettings, dispatch, updateCloudSync, testConnection, syncNow, enableAutoSync, setConflictStrategy, exportMaterials, exportProducts, importMaterials, importProducts } = useApp();
  const { showSuccess, showError } = useToast();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [showCloudSync, setShowCloudSync] = React.useState(false);
  const [showExportMaterials, setShowExportMaterials] = React.useState(false);
  const [showExportProducts, setShowExportProducts] = React.useState(false);
  const [showImportMaterials, setShowImportMaterials] = React.useState(false);
  const [showImportProducts, setShowImportProducts] = React.useState(false);
  const [importJson, setImportJson] = React.useState('');
  const [importMaterialsJson, setImportMaterialsJson] = React.useState('');
  const [importProductsJson, setImportProductsJson] = React.useState('');
  const [cloudBinId, setCloudBinId] = React.useState(state.cloudSync.jsonbin?.binId || '');
  const [cloudApiKey, setCloudApiKey] = React.useState(state.cloudSync.jsonbin?.apiKey || '');
  const [testingConnection, setTestingConnection] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-cost-estimator-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Data exported successfully!');
    setShowExport(false);
  };

  const handleExportMaterials = () => {
    const json = exportMaterials();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materials-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Materials exported successfully!');
    setShowExportMaterials(false);
  };

  const handleExportProducts = () => {
    const json = exportProducts();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Products exported successfully!');
    setShowExportProducts(false);
  };

  const handleImport = () => {
    if (importData(importJson)) {
      showSuccess('Data imported successfully!');
      setImportJson('');
      setShowImport(false);
    } else {
      showError('Invalid JSON file. Please check the format.');
    }
  };

  const handleImportMaterials = () => {
    if (importMaterials(importMaterialsJson)) {
      showSuccess('Materials imported successfully!');
      setImportMaterialsJson('');
      setShowImportMaterials(false);
    } else {
      showError('Invalid JSON file. Please check the format.');
    }
  };

  const handleImportProducts = () => {
    if (importProducts(importProductsJson)) {
      showSuccess('Products imported successfully!');
      setImportProductsJson('');
      setShowImportProducts(false);
    } else {
      showError('Invalid JSON file. Please check the format.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportJson(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleMaterialsFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportMaterialsJson(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleProductsFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportProductsJson(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Cost Estimator</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Default Values</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Default Hourly Rate (AUD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={state.settings.defaultHourlyRate}
                  onChange={(e) => updateSettings({ defaultHourlyRate: parseFloat(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Default Markup %</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={state.settings.defaultMarkupPercent}
                  onChange={(e) => updateSettings({ defaultMarkupPercent: parseFloat(e.target.value) || 0 })}
                  className="input"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
           <h3 className="text-sm font-medium text-gray-900 mb-3">Data Management</h3>
           <div className="flex flex-col gap-3">
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Download className="w-4 h-4" />}
               onClick={() => setShowExport(true)}
             >
               Export All Data
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Download className="w-4 h-4" />}
               onClick={() => setShowExportMaterials(true)}
             >
               Export Materials Only
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Download className="w-4 h-4" />}
               onClick={() => setShowExportProducts(true)}
             >
               Export Products Only
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Upload className="w-4 h-4" />}
               onClick={() => setShowImport(true)}
             >
               Import All Data
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Upload className="w-4 h-4" />}
               onClick={() => setShowImportMaterials(true)}
             >
               Import Materials Only
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Upload className="w-4 h-4" />}
               onClick={() => setShowImportProducts(true)}
             >
               Import Products Only
             </Button>
             <Button
               variant="secondary"
               size="sm"
               fullWidth
               leftIcon={<Cloud className="w-4 h-4" />}
               onClick={() => { setShowSettings(false); setShowCloudSync(true); }}
             >
               Cloud Sync Settings
             </Button>
             <Button
               variant="danger"
               size="sm"
               fullWidth
               leftIcon={<FileText className="w-4 h-4" />}
               onClick={() => {
                 if (confirm('This will delete ALL your materials, products, and settings. Are you sure?')) {
                   dispatch({ type: 'RESET_STATE' });
                   showSuccess('All data has been reset');
                   setShowSettings(false);
                 }
               }}
             >
               Reset All Data
             </Button>
           </div>
         </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowSettings(false)}>Close</Button>
        </div>
      </Modal>
      
      {/* Export Modal */}
      <Modal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Export Data"
        description="Download a JSON file with all your materials, products, and settings."
        size="sm"
      >
        <div className="text-center py-4">
          <Download className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">Your data will be downloaded as a JSON file.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowExport(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleExport}>Export</Button>
          </div>
        </div>
      </Modal>
      
      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import Data"
        description="Select a JSON file to import. This will replace all current data."
        size="md"
      >
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="input"
          />
          {importJson && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">File selected. Ready to import.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setImportJson(''); setShowImport(false); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!importJson}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Materials Modal */}
      <Modal
        isOpen={showExportMaterials}
        onClose={() => setShowExportMaterials(false)}
        title="Export Materials"
        description="Download a JSON file with all your materials."
        size="sm"
      >
        <div className="text-center py-4">
          <Download className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">Your materials will be downloaded as a JSON file.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowExportMaterials(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleExportMaterials}>Export</Button>
          </div>
        </div>
      </Modal>

      {/* Export Products Modal */}
      <Modal
        isOpen={showExportProducts}
        onClose={() => setShowExportProducts(false)}
        title="Export Products"
        description="Download a JSON file with all your products."
        size="sm"
      >
        <div className="text-center py-4">
          <Download className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">Your products will be downloaded as a JSON file.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowExportProducts(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleExportProducts}>Export</Button>
          </div>
        </div>
      </Modal>

      {/* Import Materials Modal */}
      <Modal
        isOpen={showImportMaterials}
        onClose={() => { setImportMaterialsJson(''); setShowImportMaterials(false); }}
        title="Import Materials"
        description="Select a JSON file to import materials. Existing materials will be updated, new ones added."
        size="md"
      >
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={handleMaterialsFileImport}
            className="input"
          />
          {importMaterialsJson && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">File selected. Ready to import.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setImportMaterialsJson(''); setShowImportMaterials(false); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleImportMaterials}
              disabled={!importMaterialsJson}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Products Modal */}
      <Modal
        isOpen={showImportProducts}
        onClose={() => { setImportProductsJson(''); setShowImportProducts(false); }}
        title="Import Products"
        description="Select a JSON file to import products. Existing products will be updated, new ones added."
        size="md"
      >
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={handleProductsFileImport}
            className="input"
          />
          {importProductsJson && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">File selected. Ready to import.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setImportProductsJson(''); setShowImportProducts(false); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleImportProducts}
              disabled={!importProductsJson}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cloud Sync Modal */}
      <Modal
        isOpen={showCloudSync}
        onClose={() => setShowCloudSync(false)}
        title="Cloud Sync Settings"
        description="Configure JSONBin.io to sync your data across devices. Get your API key and Bin ID from https://jsonbin.io"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">JSONBin.io Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Bin ID</label>
                <Input
                  type="text"
                  placeholder="Enter your Bin ID"
                  value={cloudBinId}
                  onChange={(e) => setCloudBinId(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">API Key (Master Key)</label>
                <Input
                  type="password"
                  placeholder="Enter your Master Key"
                  value={cloudApiKey}
                  onChange={(e) => setCloudApiKey(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sync Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Cloud Sync</p>
                  <p className="text-xs text-gray-500">Automatically sync data to JSONBin.io</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.cloudSync.enabled}
                    onChange={(e) => updateCloudSync({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between" style={{ opacity: state.cloudSync.enabled ? 1 : 0.5 }}>
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto Sync</p>
                  <p className="text-xs text-gray-500">Sync automatically when data changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.cloudSync.autoSync}
                    onChange={(e) => enableAutoSync(e.target.checked)}
                    disabled={!state.cloudSync.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between" style={{ opacity: state.cloudSync.enabled ? 1 : 0.5 }}>
                <div>
                  <p className="text-sm font-medium text-gray-900">Conflict Strategy</p>
                  <p className="text-xs text-gray-500">How to handle conflicts between local and remote data</p>
                </div>
                <select
                  value={state.cloudSync.conflictStrategy}
                  onChange={(e) => setConflictStrategy(e.target.value as 'local-wins' | 'remote-wins' | 'manual')}
                  disabled={!state.cloudSync.enabled}
                  className="input w-auto"
                >
                  <option value="remote-wins">Remote Wins (Server data overwrites local)</option>
                  <option value="local-wins">Local Wins (Keep local data)</option>
                  <option value="manual">Manual (Prompt to resolve)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={async () => {
                  setTestingConnection(true);
                  const result = await testConnection();
                  setTestingConnection(false);
                  if (result.success) {
                    showSuccess('Connection successful!');
                  } else {
                    showError(result.error || 'Connection failed');
                  }
                }}
                disabled={testingConnection || !cloudBinId || !cloudApiKey}
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<CloudCheck className="w-4 h-4" />}
                onClick={async () => {
                  setSyncing(true);
                  const result = await syncNow();
                  setSyncing(false);
                  if (result.success) {
                    showSuccess('Sync completed successfully!');
                    setShowCloudSync(false);
                  } else {
                    showError(result.error || 'Sync failed');
                  }
                }}
                disabled={syncing || !state.cloudSync.enabled || !cloudBinId || !cloudApiKey}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>

          {state.cloudSync.lastSyncAt && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800">
                <span className="font-medium">Last sync:</span> {new Date(state.cloudSync.lastSyncAt).toLocaleString()}
              </p>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>How it works:</strong> Your data is stored in a JSONBin.io bin (a cloud JSON storage).
              No backend server needed. Get a free account at jsonbin.io, create a bin, and use the Bin ID and Master Key here.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => {
            updateCloudSync({ jsonbin: { binId: cloudBinId, apiKey: cloudApiKey } });
            setShowCloudSync(false);
          }}>Save & Close</Button>
        </div>
      </Modal>
    </header>
  );
};