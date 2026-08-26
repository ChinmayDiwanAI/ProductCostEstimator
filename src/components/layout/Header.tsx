import React from 'react';
import { Settings, Download, Upload, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';

export const Header: React.FC = () => {
  const { state, exportData, importData, updateSettings, dispatch } = useApp();
  const { showSuccess, showError } = useToast();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [importJson, setImportJson] = React.useState('');

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

  const handleImport = () => {
    if (importData(importJson)) {
      showSuccess('Data imported successfully!');
      setImportJson('');
      setShowImport(false);
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
                Export Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setShowImport(true)}
              >
                Import Data
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
    </header>
  );
};