import React from 'react';
import { MaterialCard } from './MaterialCard';
import { MATERIAL_CATEGORIES, type Material, type MaterialCategory } from '../../types';

interface MaterialListProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export const MaterialList: React.FC<MaterialListProps> = ({
  materials,
  onEdit,
  onDelete,
}) => {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No materials yet</h3>
        <p className="text-gray-500">Add your first material to get started</p>
      </div>
    );
  }

  // Group materials by category
  const groupedMaterials = materials.reduce((acc, material) => {
    const category = material.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

  const categoryOrder: MaterialCategory[] = [
    'PIPECLEANER',
    'BEAD',
    'PEARL',
    'WIRE',
    'TAPE',
    'GLUE',
    'OTHER',
  ];

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const categoryMaterials = groupedMaterials[category];
        if (!categoryMaterials || categoryMaterials.length === 0) return null;
        
        const categoryInfo = MATERIAL_CATEGORIES.find(c => c.value === category);
        
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryInfo?.icon}</span>
              <h3 className="font-semibold text-gray-900 capitalize">{categoryInfo?.label.toLowerCase()}</h3>
              <span className="badge-gray">{categoryMaterials.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onEdit={() => onEdit(material)}
                  onDelete={() => onDelete(material)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};