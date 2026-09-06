import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Product {
  id: string;
  farmer_id: string;
  vegetable_id: string;
  vegetable_name: string;
  farmer_name: string;
  available_quantity: number;
  unit: string;
  veg_unit?: string;
  current_price: number;
  farm_location: string;
  village?: string;
}

const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filterType === 'All' 
    ? products 
    : products.filter(p => (p.vegetable_name || '').toLowerCase().includes(filterType.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products Overview</h1>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Vegetables</option>
          {Array.from(new Set(products.map(p => p.vegetable_name || 'Unknown').filter(Boolean))).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-4 hover:shadow-md transition-shadow">
            <div className="w-full h-32 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-green-600">{(product.vegetable_name || '?').charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{product.vegetable_name || 'Unknown Product'}</h3>
              <p className="text-sm text-gray-500 mb-2">by {product.farmer_name || 'Unknown Farmer'}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{product.village || product.farm_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available:</span>
                  <span className="font-medium">{product.available_quantity} {product.unit || product.veg_unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Market Price:</span>
                  <span className="font-bold text-green-600">₹{product.current_price}/{product.unit || product.veg_unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No products found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
