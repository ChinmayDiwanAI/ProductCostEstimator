import React from 'react';
import { Edit, Trash2, Copy, Calculator as CalcIcon } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCalculate: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onCalculate,
}) => {
  const materialCount = product.materials.length;
  const updatedDate = new Date(product.updatedAt).toLocaleDateString();

  return (
    <Card hoverable className="relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
          
          {product.photo && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 mb-2">
              <img
                src={product.photo}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {product.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true"></span>
              {materialCount} material{materialCount !== 1 ? 's' : ''}
            </span>
            <span>Updated {updatedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(product.laborHours * product.hourlyRate + 
                product.materials.reduce((sum, m) => sum + (m.lineTotal || 0), 0) * (1 + product.markupPercent / 100))}
            </p>
            <p className="text-xs text-gray-500">Est. Total</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCalculate}
              aria-label="Calculate cost"
              className="p-1.5"
            >
              <CalcIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              aria-label="Edit product"
              className="p-1.5"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              aria-label="Duplicate product"
              className="p-1.5"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              aria-label="Delete product"
              className="p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};