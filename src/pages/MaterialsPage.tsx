import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MaterialList } from '../components/materials/MaterialList';
import { MaterialForm } from '../components/materials/MaterialForm';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/common/Toast';
import type { Material } from '../types';

export const MaterialsPage: React.FC = () => {
  const { state, deleteMaterial } = useApp();
  const { showSuccess, showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  const filteredMaterials = state.materials.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDelete = (material: Material) => {
    setDeletingMaterial(material);
  };

  const confirmDelete = () => {
    if (deletingMaterial) {
      try {
        deleteMaterial(deletingMaterial.id);
        showSuccess('Material deleted');
      } catch {
        showError('Failed to delete material');
      }
      setDeletingMaterial(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
          <p className="text-gray-500 mt-1">Manage your raw materials and their costs</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => { setEditingMaterial(null); setShowForm(true); }}
        >
          Add Material
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{state.materials.length}</p>
          <p className="text-sm text-gray-500">Total Materials</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.materials.filter(m => m.category === 'BEAD' || m.category === 'PEARL').length}
          </p>
          <p className="text-sm text-gray-500">Beads & Pearls</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.materials.filter(m => m.category === 'WIRE' || m.category === 'TAPE').length}
          </p>
          <p className="text-sm text-gray-500">Wire & Tape</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.materials.filter(m => m.category === 'GLUE' || m.category === 'PIPECLEANER' || m.category === 'OTHER').length}
          </p>
          <p className="text-sm text-gray-500">Other Supplies</p>
        </div>
      </div>

      {/* Materials List */}
      <MaterialList
        materials={filteredMaterials}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <MaterialForm
        isOpen={showForm}
        onClose={handleFormClose}
        material={editingMaterial}
      />

      {/* Delete Confirmation Modal */}
      {deletingMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeletingMaterial(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 id="delete-title" className="text-lg font-semibold text-gray-900 mb-2">
              Delete Material
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deletingMaterial.name}</strong>?
              This will also remove it from any products that use it.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingMaterial(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};