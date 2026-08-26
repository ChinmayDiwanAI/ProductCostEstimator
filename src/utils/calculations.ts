import type { Material, ProductMaterial, CostBreakdown } from '../types';

export function calculateCostPerUnit(bulkCost: number, bulkQuantity: number): number {
  return bulkQuantity > 0 ? bulkCost / bulkQuantity : 0;
}

export function calculateLineTotal(quantity: number, costPerUnit: number): number {
  return quantity * costPerUnit;
}

export function calculateMaterialCost(materials: ProductMaterial[]): number {
  return materials.reduce((sum, m) => sum + (m.lineTotal || 0), 0);
}

export function calculateLaborCost(hours: number, hourlyRate: number): number {
  return hours * hourlyRate;
}

export function calculateMarkup(subtotal: number, markupPercent: number): number {
  return subtotal * (markupPercent / 100);
}

export function calculateTotalPrice(
  materials: ProductMaterial[],
  laborHours: number,
  hourlyRate: number,
  markupPercent: number
): CostBreakdown {
  const materialCost = calculateMaterialCost(materials);
  const laborCost = calculateLaborCost(laborHours, hourlyRate);
  const subtotal = materialCost + laborCost;
  const markupAmount = calculateMarkup(subtotal, markupPercent);
  
  return {
    materialCost,
    laborCost,
    subtotal,
    markupAmount,
    totalPrice: subtotal + markupAmount,
    materials,
  };
}

export function resolveProductMaterials(
  productMaterials: ProductMaterial[],
  allMaterials: Material[]
): ProductMaterial[] {
  return productMaterials.map(pm => {
    const material = allMaterials.find(m => m.id === pm.materialId);
    if (!material) return pm;
    
    const costPerUnit = material.costPerUnit;
    const lineTotal = calculateLineTotal(pm.quantity, costPerUnit);
    
    return {
      ...pm,
      materialName: material.name,
      unit: material.unit,
      costPerUnit,
      lineTotal,
    };
  });
}

export function createMaterialWithCostPerUnit(material: Omit<Material, 'costPerUnit' | 'createdAt' | 'updatedAt'>): Material {
  const now = new Date().toISOString();
  return {
    ...material,
    costPerUnit: calculateCostPerUnit(material.bulkCost, material.bulkQuantity),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateMaterialCostPerUnit(material: Material): Material {
  return {
    ...material,
    costPerUnit: calculateCostPerUnit(material.bulkCost, material.bulkQuantity),
    updatedAt: new Date().toISOString(),
  };
}