import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { validateProduct } from '../../utils/validation';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/currency';
import { Plus, X } from 'lucide-react';
import type { Product, ProductMaterial, Material } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { state, addProduct, updateProduct } = useApp();
  const { showSuccess, showError } = useToast();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: '',
    materials: [] as ProductMaterial[],
    laborHours: 1,
    hourlyRate: state.settings.defaultHourlyRate,
    markupPercent: state.settings.defaultMarkupPercent,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        photo: product.photo || '',
        materials: product.materials.map(pm => ({
          materialId: pm.materialId,
          quantity: pm.quantity,
        })),
        laborHours: product.laborHours,
        hourlyRate: product.hourlyRate,
        markupPercent: product.markupPercent,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        photo: '',
        materials: [],
        laborHours: 1,
        hourlyRate: state.settings.defaultHourlyRate,
        markupPercent: state.settings.defaultMarkupPercent,
      });
    }
    setErrors({});
  }, [product, isOpen, state.settings.defaultHourlyRate, state.settings.defaultMarkupPercent]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Photo must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, photo: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  const handleMaterialChange = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials[index] = { ...newMaterials[index], [field]: value };
      return { ...prev, materials: newMaterials };
    });
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { materialId: '', quantity: 1 }],
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        photo: formData.photo,
        materials: formData.materials.map(m => ({
          materialId: m.materialId,
          quantity: m.quantity,
        })),
        laborHours: formData.laborHours,
        hourlyRate: formData.hourlyRate,
        markupPercent: formData.markupPercent,
      };
      
      if (isEditing && product) {
        updateProduct({ ...product, ...productData });
        showSuccess('Product updated successfully');
      } else {
        addProduct(productData);
        showSuccess('Product added successfully');
      }
      onClose();
    } catch (error) {
      showError('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'New Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="e.g., Wedding Garland - White & Gold"
            autoFocus
          />
          
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Details about this product..."
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label">Product Photo (optional)</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="input"
                id="photo-upload"
              />
              {formData.photo && (
                <div className="mt-3 relative w-32 h-32">
                  <img
                    src={formData.photo}
                    alt="Product preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Tap to upload a photo (max 5MB)</p>
          </div>
        </div>

        {/* Materials Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Materials</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addMaterial}
            >
              Add Material
            </Button>
          </div>
          
          {formData.materials.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No materials added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Material" to start building your recipe</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.materials.map((material, index) => (
                <MaterialPickerRow
                  key={index}
                  index={index}
                  material={material}
                  allMaterials={state.materials}
                  onChange={handleMaterialChange}
                  onRemove={() => removeMaterial(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Labor & Markup Section */}
        <div className="border-t border-gray-100 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Labor Hours *"
            type="number"
            min="0"
            step="0.25"
            value={formData.laborHours}
            onChange={(e) => handleChange('laborHours', parseFloat(e.target.value) || 0)}
            error={errors.laborHours}
            placeholder="1.5"
            helperText="Time to make this product"
          />
          
          <Input
            label="Hourly Rate (AUD) *"
            type="number"
            min="0"
            step="0.5"
            value={formData.hourlyRate}
            onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
            error={errors.hourlyRate}
            placeholder="25.00"
          />
          
          <Input
            label="Markup % *"
            type="number"
            min="0"
            step="1"
            value={formData.markupPercent}
            onChange={(e) => handleChange('markupPercent', parseFloat(e.target.value) || 0)}
            error={errors.markupPercent}
            placeholder="50"
            helperText="Profit margin"
          />
        </div>

        {/* Live Preview */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h4 className="font-medium text-primary-900 mb-3">Cost Preview</h4>
          <ProductCostPreview
            materials={formData.materials}
            allMaterials={state.materials}
            laborHours={formData.laborHours}
            hourlyRate={formData.hourlyRate}
            markupPercent={formData.markupPercent}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Helper component for material picker rows
interface MaterialPickerRowProps {
  index: number;
  material: ProductMaterial;
  allMaterials: Material[];
  onChange: (index: number, field: 'materialId' | 'quantity', value: string | number) => void;
  onRemove: () => void;
}

const MaterialPickerRow: React.FC<MaterialPickerRowProps> = ({
  index,
  material,
  allMaterials,
  onChange,
  onRemove,
}) => {
  const selectedMaterial = allMaterials.find(m => m.id === material.materialId);
  const costPerUnit = selectedMaterial?.costPerUnit || 0;
  const lineTotal = material.quantity * costPerUnit;

  const materialOptions = [
    { value: '', label: 'Select a material...' },
    ...allMaterials.map(m => ({ value: m.id, label: `${m.name} (${formatCurrency(m.costPerUnit)}/${m.unit})` })),
  ];

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
      <select
        value={material.materialId}
        onChange={(e) => onChange(index, 'materialId', e.target.value)}
        className="flex-1 input py-2 text-sm"
        aria-label={`Material ${index + 1}`}
      >
        {materialOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <input
        type="number"
        min="0"
        step="0.1"
        value={material.quantity}
        onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        className="w-20 input py-2 text-sm text-center"
        aria-label="Quantity"
      />
      
      <span className="w-28 text-right text-sm font-medium text-gray-900">
        {formatCurrency(lineTotal)}
      </span>
      
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
        aria-label="Remove material"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Cost preview component
interface ProductCostPreviewProps {
  materials: ProductMaterial[];
  allMaterials: Material[];
  laborHours: number;
  hourlyRate: number;
  markupPercent: number;
}

const ProductCostPreview: React.FC<ProductCostPreviewProps> = ({
  materials,
  allMaterials,
  laborHours,
  hourlyRate,
  markupPercent,
}) => {
  const materialCost = materials.reduce((sum, m) => {
    const mat = allMaterials.find(mat => mat.id === m.materialId);
    return sum + (mat ? m.quantity * mat.costPerUnit : 0);
  }, 0);
  
  const laborCost = laborHours * hourlyRate;
  const subtotal = materialCost + laborCost;
  const markupAmount = subtotal * (markupPercent / 100);
  const totalPrice = subtotal + markupAmount;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Material Cost</span>
        <span className="font-medium">{formatCurrency(materialCost)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Labor Cost</span>
        <span className="font-medium">{formatCurrency(laborCost)}</span>
      </div>
      <div className="border-t border-primary-200 pt-2 flex justify-between">
        <span className="font-medium text-gray-900">Subtotal</span>
        <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-primary-700">
        <span>Markup ({markupPercent}%)</span>
        <span className="font-medium">{formatCurrency(markupAmount)}</span>
      </div>
      <div className="border-t border-primary-300 pt-2 flex justify-between text-lg">
        <span className="font-bold text-primary-900">Total Price</span>
        <span className="font-bold text-primary-900">{formatCurrency(totalPrice)}</span>
      </div>
    </div>
  );
};