import React, { useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ProductCard } from '../components/products/ProductCard';
import { ProductForm } from '../components/products/ProductForm';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

export const ProductsPage: React.FC = () => {
  const { state, deleteProduct, exportProducts } = useApp();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = state.products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      try {
        deleteProduct(deletingProduct.id);
        showSuccess('Product deleted');
      } catch {
        showError('Failed to delete product');
      }
      setDeletingProduct(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const { addProduct } = useApp();

  const handleExport = () => {
    const json = exportProducts();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Products exported successfully!');
  };

  const handleDuplicateConfirm = (product: Product) => {
    const newProduct = {
      name: `${product.name} (Copy)`,
      description: product.description,
      materials: product.materials.map(m => ({ materialId: m.materialId, quantity: m.quantity })),
      laborHours: product.laborHours,
      hourlyRate: product.hourlyRate,
      markupPercent: product.markupPercent,
    };
    addProduct(newProduct);
    showSuccess('Product duplicated');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Your saved product recipes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="w-5 h-5" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
          >
            New Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{state.products.length}</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.products.reduce((sum, p) => sum + p.materials.length, 0)}
          </p>
          <p className="text-sm text-gray-500">Total Materials Used</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.products.length > 0 
              ? (state.products.reduce((sum, p) => sum + p.laborHours, 0) / state.products.length).toFixed(1)
              : '0'}
          </p>
          <p className="text-sm text-gray-500">Avg Labor Hours</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">
            {state.products.length > 0
              ? Math.round(state.products.reduce((sum, p) => sum + p.markupPercent, 0) / state.products.length)
              : '0'}%
          </p>
          <p className="text-sm text-gray-500">Avg Markup</p>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4M4 7v10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
          <p className="text-gray-500 mb-6">Create your first product recipe</p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
          >
            New Product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product)}
              onDuplicate={() => handleDuplicateConfirm(product)}
              onCalculate={() => {
                // Navigate to calculator with this product pre-filled
                navigate(`/calculator?product=${product.id}`);
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ProductForm
        isOpen={showForm}
        onClose={handleFormClose}
        product={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeletingProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 id="delete-title" className="text-lg font-semibold text-gray-900 mb-2">
              Delete Product
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deletingProduct.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingProduct(null)}>
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