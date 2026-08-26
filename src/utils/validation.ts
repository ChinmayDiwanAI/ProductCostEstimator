export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMaterial(data: {
  name: string;
  category: string;
  unit: string;
  bulkQuantity: number;
  bulkCost: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) {
    errors.name = 'Material name is required';
  }
  
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  if (!data.unit.trim()) {
    errors.unit = 'Unit is required (e.g., pieces, meters, grams)';
  }
  
  if (data.bulkQuantity <= 0) {
    errors.bulkQuantity = 'Bulk quantity must be greater than 0';
  }
  
  if (data.bulkCost < 0) {
    errors.bulkCost = 'Bulk cost cannot be negative';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProduct(data: {
  name: string;
  materials: Array<{ materialId: string; quantity: number }>;
  laborHours: number;
  hourlyRate: number;
  markupPercent: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) {
    errors.name = 'Product name is required';
  }
  
  if (data.materials.length === 0) {
    errors.materials = 'At least one material is required';
  } else {
    data.materials.forEach((m, index) => {
      if (!m.materialId) {
        errors[`material_${index}`] = 'Material is required';
      }
      if (m.quantity <= 0) {
        errors[`quantity_${index}`] = 'Quantity must be greater than 0';
      }
    });
  }
  
  if (data.laborHours < 0) {
    errors.laborHours = 'Labor hours cannot be negative';
  }
  
  if (data.hourlyRate < 0) {
    errors.hourlyRate = 'Hourly rate cannot be negative';
  }
  
  if (data.markupPercent < 0) {
    errors.markupPercent = 'Markup percentage cannot be negative';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (value <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
}

export function validateNonNegativeNumber(value: number, fieldName: string): string | null {
  if (value < 0) {
    return `${fieldName} cannot be negative`;
  }
  return null;
}