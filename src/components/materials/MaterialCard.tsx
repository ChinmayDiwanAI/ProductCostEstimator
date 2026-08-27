import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MATERIAL_CATEGORIES } from '../../types';
import type { Material } from '../../types';

interface MaterialCardProps {
  material: Material;
  onEdit: () => void;
  onDelete: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onEdit,
  onDelete,
}) => {
  const category = MATERIAL_CATEGORIES.find(c => c.value === material.category);
  
  return (
    <Card hoverable className="relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{category?.icon || '📦'}</span>
            <h3 className="font-medium text-gray-900 truncate">{material.name}</h3>
            <span className="badge-primary flex-shrink-0">{category?.label || material.category}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-900">
              {material.costPerUnit.toFixed(5)}
            </span>
            <span className="text-gray-400">/</span>
            <span>{material.unit}</span>
          </div>
          
          <p className="text-xs text-gray-500">
            {material.bulkCost.toFixed(5)} for {material.bulkQuantity} {material.unit}
          </p>
          
          {material.supplier && (
            <p className="text-xs text-gray-500 mt-1">
              Supplier: {material.supplier}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label="Edit material"
            className="p-1.5"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label="Delete material"
            className="p-1.5 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};