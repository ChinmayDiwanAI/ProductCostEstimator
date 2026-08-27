import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { MATERIAL_CATEGORIES, type MaterialCategory } from '../../types';
import { validateMaterial } from '../../utils/validation';
import { useToast } from '../common/Toast';

import type { Material } from '../../types';

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  material?: Material | null;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const { addMaterial, updateMaterial } = useApp();
  const { showSuccess, showError } = useToast();
  const isEditing = !!material;

  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER' as MaterialCategory,
    unit: '',
    bulkQuantity: 1,
    bulkCost: 0,
    supplier: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        category: material.category,
        unit: material.unit,
        bulkQuantity: material.bulkQuantity,
        bulkCost: material.bulkCost,
        supplier: material.supplier || '',
        notes: material.notes || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'OTHER' as MaterialCategory,
        unit: '',
        bulkQuantity: 1,
        bulkCost: 0,
        supplier: '',
        notes: '',
      });
    }
    setErrors({});
  }, [material, isOpen]);

  const costPerUnit = formData.bulkQuantity > 0 
    ? formData.bulkCost / formData.bulkQuantity 
    : 0;

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateMaterial(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && material) {
        updateMaterial({
          ...material,
          ...formData,
          costPerUnit: formData.bulkCost / formData.bulkQuantity,
          updatedAt: new Date().toISOString(),
        });
        showSuccess('Material updated successfully');
      } else {
        addMaterial(formData);
        showSuccess('Material added successfully');
      }
      onClose();
    } catch (error) {
      showError('Failed to save material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = MATERIAL_CATEGORIES.map(c => ({
    value: c.value,
    label: `${c.icon} ${c.label}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Material' : 'Add Material'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Material Name *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="e.g., 6mm White Pearls"
            autoFocus
          />
          <Select
            label="Category *"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value as MaterialCategory)}
            error={errors.category}
            options={categoryOptions}
            placeholder="Select category"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Unit *"
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            error={errors.unit}
            placeholder="pieces"
            helperText="e.g., pieces, meters, grams, ml, rolls"
          />
          <Input
            label="Bulk Quantity *"
            type="number"
            min="1"
            step="1"
            value={formData.bulkQuantity}
            onChange={(e) => handleChange('bulkQuantity', parseInt(e.target.value) || 1)}
            error={errors.bulkQuantity}
            placeholder="100"
            helperText="How many units per pack"
          />
          <Input
            label="Bulk Cost (AUD) *"
            type="number"
            min="0"
            step="0.00001"
            value={formData.bulkCost}
            onChange={(e) => handleChange('bulkCost', parseFloat(e.target.value) || 0)}
            error={errors.bulkCost}
            placeholder="5.00000"
            helperText="Total cost for bulk quantity (supports 5 decimal places)"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cost per unit:</span>{' '}
            <span className="text-primary-600 font-semibold">
              {costPerUnit.toFixed(5)} AUD/{formData.unit || 'unit'}
            </span>
          </p>
        </div>

        <Input
          label="Supplier (optional)"
          value={formData.supplier}
          onChange={(e) => handleChange('supplier', e.target.value)}
          placeholder="e.g., Craft Store Australia"
        />

        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input min-h-[80px] resize-y"
            placeholder="Any additional details..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Material'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};