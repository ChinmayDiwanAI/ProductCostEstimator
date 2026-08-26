import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/currency';
import { MATERIAL_CATEGORIES } from '../../types';
import type { Material, ProductMaterial } from '../../types';

interface MaterialPickerProps {
  materials: ProductMaterial[];
  allMaterials: Material[];
  onChange: (materials: ProductMaterial[]) => void;
  onAddMaterial: () => void;
}

export const MaterialPicker: React.FC<MaterialPickerProps> = ({
  materials,
  allMaterials,
  onChange,
  onAddMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPicker, setShowPicker] = useState(-1);

  const filteredMaterials = allMaterials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMaterialSelect = (index: number, materialId: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], materialId, quantity: 1 };
    onChange(newMaterials);
    setShowPicker(-1);
    setSearchQuery('');
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], quantity };
    onChange(newMaterials);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    onChange(newMaterials);
  };

  const renderMaterialRow = (material: ProductMaterial, index: number) => {
    const selectedMaterial = allMaterials.find(m => m.id === material.materialId);
    const costPerUnit = selectedMaterial?.costPerUnit || 0;
    const lineTotal = material.quantity * costPerUnit;

    if (!material.materialId) {
      // Empty row - show picker
      return (
        <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
          <button
            type="button"
            onClick={() => setShowPicker(index)}
            className="flex-1 text-left py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Select a material...
            </span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveMaterial(index)}
            aria-label="Remove"
            className="p-1.5 text-gray-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{selectedMaterial?.name}</p>
          <p className="text-sm text-gray-500">
            {formatCurrency(costPerUnit)}/{selectedMaterial?.unit}
          </p>
        </div>
        
        <input
          type="number"
          min="0"
          step="0.1"
          value={material.quantity}
          onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
          className="w-20 input py-2 text-sm text-center"
          aria-label="Quantity"
        />
        
        <span className="w-28 text-right text-sm font-medium text-gray-900">
          {formatCurrency(lineTotal)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveMaterial(index)}
          aria-label="Remove"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {materials.map((material, index) => renderMaterialRow(material, index))}
      
      {materials.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">No materials added yet</p>
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={onAddMaterial}>
            Add First Material
          </Button>
        </div>
      )}
      
      {materials.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAddMaterial}
          className="w-full"
        >
          Add Another Material
        </Button>
      )}

      {/* Material Picker Dropdown */}
      {showPicker >= 0 && (
        <div className="fixed inset-0 z-50" onClick={() => setShowPicker(-1)}>
          <div
            className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 p-0"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredMaterials.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No materials found</div>
              ) : (
                filteredMaterials.map(material => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => handleMaterialSelect(showPicker, material.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">{MATERIAL_CATEGORIES.find(c => c.value === material.category)?.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{material.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(material.costPerUnit)}/{material.unit}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};