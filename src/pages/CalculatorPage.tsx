import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Download, Copy, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MaterialPicker } from '../components/calculator/MaterialPicker';
import { CostBreakdown } from '../components/calculator/CostBreakdown';
import { ProductForm } from '../components/products/ProductForm';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/currency';
import type { Product, ProductMaterial } from '../types';

export const CalculatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, calculateCost, getProductById } = useApp();
  const { showSuccess } = useToast();
  
  const [materials, setMaterials] = useState<ProductMaterial[]>([]);
  const [laborHours, setLaborHours] = useState(state.settings.defaultHourlyRate > 0 ? 1 : 0);
  const [hourlyRate, setHourlyRate] = useState(state.settings.defaultHourlyRate);
  const [markupPercent, setMarkupPercent] = useState(state.settings.defaultMarkupPercent);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState<Product | null>(null);

  // Load product from URL param
  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setMaterials(product.materials);
        setLaborHours(product.laborHours);
        setHourlyRate(product.hourlyRate);
        setMarkupPercent(product.markupPercent);
        setSavingProduct(product); // For updating existing
      }
      // Clear the URL param
      setSearchParams({});
    }
  }, [searchParams, getProductById, setSearchParams]);

  const calculation = calculateCost(materials, laborHours, hourlyRate, markupPercent);

  const handleAddMaterial = () => {
    setMaterials(prev => [...prev, { materialId: '', quantity: 1 }]);
  };

  const handleSaveAsProduct = () => {
    setShowSaveForm(true);
  };

  const handleFormClose = () => {
    setShowSaveForm(false);
    setSavingProduct(null);
  };

  const handleExport = () => {
    const exportData = {
      name: 'Custom Calculation',
      materials: materials.map(m => {
        const mat = state.materials.find(mat => mat.id === m.materialId);
        return {
          material: mat?.name,
          quantity: m.quantity,
          unit: mat?.unit,
          costPerUnit: mat?.costPerUnit,
          lineTotal: m.quantity * (mat?.costPerUnit || 0),
        };
      }),
      laborHours,
      hourlyRate,
      markupPercent,
      materialCost: calculation.materialCost,
      laborCost: calculation.laborCost,
      subtotal: calculation.subtotal,
      markupAmount: calculation.markupAmount,
      totalPrice: calculation.totalPrice,
      calculatedAt: new Date().toISOString(),
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-calculation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Calculation exported!');
  };

  const handleCopySummary = () => {
    const resolvedMaterials = calculation.materials.map(m => {
      const material = state.materials.find(mat => mat.id === m.materialId);
      return {
        ...m,
        material,
        lineTotal: m.quantity * (material?.costPerUnit || 0),
      };
    });
    
    const summary = `
Product Cost Calculation
========================
Materials:
${resolvedMaterials.map(m =>
  `  ${m.quantity} x ${m.material?.name || 'Unknown'} @ ${formatCurrency(m.material?.costPerUnit || 0)}/${m.material?.unit || ''} = ${formatCurrency(m.lineTotal)}`
).join('\n')}
Material Cost: ${formatCurrency(calculation.materialCost)}
Labor: ${laborHours}h @ ${formatCurrency(hourlyRate)}/hr = ${formatCurrency(calculation.laborCost)}
Subtotal: ${formatCurrency(calculation.subtotal)}
Markup (${markupPercent}%): ${formatCurrency(calculation.markupAmount)}
Total Price: ${formatCurrency(calculation.totalPrice)}
    `.trim();
    
    navigator.clipboard.writeText(summary);
    showSuccess('Summary copied to clipboard!');
  };

  const handleNewCalculation = () => {
    setMaterials([]);
    setLaborHours(1);
    setHourlyRate(state.settings.defaultHourlyRate);
    setMarkupPercent(state.settings.defaultMarkupPercent);
    setSavingProduct(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calculator</h1>
          <p className="text-gray-500 mt-1">Estimate production costs for your garlands</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleNewCalculation}>
            New
          </Button>
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="secondary" leftIcon={<Copy className="w-4 h-4" />} onClick={handleCopySummary}>
            Copy
          </Button>
          <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveAsProduct}>
            Save as Product
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Materials & Labor Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials Section */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4M4 7v10" />
                </svg>
                Materials
              </h2>
              <span className="badge-primary">{materials.filter(m => m.materialId).length} items</span>
            </div>
            <div className="card-body">
              <MaterialPicker
                materials={materials}
                allMaterials={state.materials}
                onChange={setMaterials}
                onAddMaterial={handleAddMaterial}
              />
            </div>
          </div>

          {/* Labor & Markup Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Labor & Markup
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Labor Hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                  placeholder="1.5"
                  helperText="Time to make one unit"
                />
                <Input
                  label="Hourly Rate (AUD)"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  placeholder="25.00"
                />
                <Input
                  label="Markup %"
                  type="number"
                  min="0"
                  step="1"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  helperText="Profit margin"
                />
              </div>
              
              {/* Quick presets */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-3">Quick presets:</p>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1, 1.5, 2, 3].map(hours => (
                    <Button
                      key={hours}
                      variant="ghost"
                      size="sm"
                      onClick={() => setLaborHours(hours)}
                      className={laborHours === hours ? 'bg-primary-100 text-primary-700 border-primary-200' : ''}
                    >
                      {hours}h
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cost Breakdown */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
            </div>
            <div className="card-body">
              <CostBreakdown
                materials={materials}
                allMaterials={state.materials}
                laborHours={laborHours}
                hourlyRate={hourlyRate}
                markupPercent={markupPercent}
              />
            </div>
            
            {/* Total Price Card */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Price</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(calculation.totalPrice)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(calculation.subtotal)} + {formatCurrency(calculation.markupAmount)} markup
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save as Product Modal */}
      <ProductForm
        isOpen={showSaveForm}
        onClose={handleFormClose}
        product={savingProduct || undefined}
      />
    </div>
  );
};