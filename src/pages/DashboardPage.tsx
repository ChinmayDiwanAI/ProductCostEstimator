import React, { useState } from 'react';
import { Calculator, ClipboardList, Package, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProductCard } from '../components/products/ProductCard';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import type { Product } from '../types';

export const DashboardPage: React.FC = () => {
  const { state, calculateCost, deleteProduct } = useApp();
  const navigate = useNavigate();
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Calculate stats
  const totalProducts = state.products.length;
  const totalMaterials = state.materials.length;
  const avgMarkup = totalProducts > 0 
    ? Math.round(state.products.reduce((sum, p) => sum + p.markupPercent, 0) / totalProducts)
    : 0;
  
  // Total value of all products
  const totalValue = state.products.reduce((sum, product) => {
    const calc = calculateCost(product.materials, product.laborHours, product.hourlyRate, product.markupPercent);
    return sum + calc.totalPrice;
  }, 0);

  // Recent products (last 5)
  const recentProducts = [...state.products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Most expensive products
  const productsWithCost = state.products.map(product => ({
    ...product,
    cost: calculateCost(product.materials, product.laborHours, product.hourlyRate, product.markupPercent).totalPrice,
  })).sort((a, b) => b.cost - a.cost);

  const topProducts = productsWithCost.slice(0, 3);

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleCalculate = (product: Product) => {
    navigate(`/calculator?product=${product.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your garland business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<ClipboardList className="w-6 h-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Materials Tracked"
          value={totalMaterials}
          icon={<Package className="w-6 h-6" />}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Avg Markup"
          value={`${avgMarkup}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Quick Actions - Primary actions only */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Calculator className="w-5 h-5" />}
          onClick={() => navigate('/calculator')}
        >
          New Calculation
        </Button>
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => navigate('/products')}
        >
          Create Product
        </Button>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Highest Value Products</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
              View All
            </Button>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.materials.length} materials • {product.laborHours}h labor
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(product.cost)}</p>
                    <p className="text-xs text-gray-400">Total price</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
            View All
          </Button>
        </div>
        <div className="card-body">
          {recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
              <p className="text-gray-500 mb-4">Create your first product to get started</p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/products')}
              >
                Create Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => navigate(`/products?edit=${product.id}`)}
                  onDelete={() => setDeletingProduct(product)}
                  onDuplicate={() => {}}
                  onCalculate={() => handleCalculate(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Material Categories Overview */}
      {state.materials.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Materials by Category</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {['PIPECLEANER', 'BEAD', 'PEARL', 'WIRE', 'TAPE', 'GLUE', 'OTHER'].map(category => {
                const count = state.materials.filter(m => m.category === category).length;
                if (count === 0) return null;
                
                const categoryInfo: Record<string, { icon: string; color: string }> = {
                  PIPECLEANER: { icon: '🧶', color: 'bg-pink-100 text-pink-600' },
                  BEAD: { icon: '🔮', color: 'bg-blue-100 text-blue-600' },
                  PEARL: { icon: '🤍', color: 'bg-purple-100 text-purple-600' },
                  WIRE: { icon: '🔗', color: 'bg-gray-100 text-gray-600' },
                  TAPE: { icon: '📦', color: 'bg-green-100 text-green-600' },
                  GLUE: { icon: '💧', color: 'bg-yellow-100 text-yellow-600' },
                  OTHER: { icon: '📦', color: 'bg-gray-100 text-gray-600' },
                };
                
                const info = categoryInfo[category];
                if (!info) return null;
                
                return (
                  <div key={category} className={`p-4 rounded-lg ${info.color} text-center`}>
                    <span className="text-2xl">{info.icon}</span>
                    <p className="text-sm font-medium capitalize mt-1">{category.toLowerCase()}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);