import React from 'react';
import { formatCurrency } from '../../utils/currency';
import type { ProductMaterial, Material } from '../../types';

interface CostBreakdownProps {
  materials: ProductMaterial[];
  allMaterials: Material[];
  laborHours: number;
  hourlyRate: number;
  markupPercent: number;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  materials,
  allMaterials,
  laborHours,
  hourlyRate,
  markupPercent,
}) => {
  const resolvedMaterials = materials.map(pm => {
    const material = allMaterials.find(m => m.id === pm.materialId);
    return {
      ...pm,
      material,
      costPerUnit: material?.costPerUnit || 0,
      lineTotal: pm.quantity * (material?.costPerUnit || 0),
    };
  });

  const materialCost = resolvedMaterials.reduce((sum, m) => sum + m.lineTotal, 0);
  const laborCost = laborHours * hourlyRate;
  const subtotal = materialCost + laborCost;
  const markupAmount = subtotal * (markupPercent / 100);
  const totalPrice = subtotal + markupAmount;

  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Add materials to see cost breakdown</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Materials */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4M4 7v10" />
            </svg>
          </span>
          Materials ({resolvedMaterials.length})
        </h4>
        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
          {resolvedMaterials.map((m, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{m.material?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {m.quantity} × {m.costPerUnit.toFixed(5)}/{m.material?.unit}
                  </p>
                </div>
              </div>
              <span className="font-medium text-gray-900">{formatCurrency(m.lineTotal)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
            <span>Material Cost</span>
            <span>{formatCurrency(materialCost)}</span>
          </div>
        </div>
      </div>

      {/* Labor */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Labor
        </h4>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{laborHours}h × {formatCurrency(hourlyRate)}/hr</span>
            <span className="font-medium">{formatCurrency(laborCost)}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
          <span>Markup ({markupPercent}%)</span>
          <span className="font-medium">{formatCurrency(markupAmount)}</span>
        </div>
        
        <div className="border-t border-gray-300 pt-3 flex justify-between text-lg">
          <span className="font-bold text-gray-900">Total Price</span>
          <span className="font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      {/* Per-unit info if multiple quantities */}
      {laborHours > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Cost per hour of labor: <strong>{formatCurrency(totalPrice / laborHours)}</strong>
          </p>
        </div>
      )}
    </div>
  );
};