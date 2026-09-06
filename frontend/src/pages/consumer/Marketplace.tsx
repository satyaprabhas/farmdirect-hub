import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Package, ShoppingCart, CheckCircle, Filter } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import QuantitySelector from '../../components/common/QuantitySelector';
import PriceDisplay from '../../components/common/PriceDisplay';

interface Product {
  id: number;
  vegetable_id: number;
  vegetable_name: string;
  farmer_id: number;
  farm_name: string;
  farm_location: string;
  farmer_name: string;
  is_verified: number;
  available_quantity: number;
  unit: string;
  current_price: number;
  images: { image_url: string }[];
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVeg, setSelectedVeg] = useState('All');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('Recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedVeg, location, sortBy, verifiedOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedVeg !== 'All') params.append('vegetable', selectedVeg);
      if (location) params.append('location', location);
      params.append('sort', sortBy);
      if (verifiedOnly) params.append('verified', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data || []);
      
      // Initialize quantities
      const initialQuantities: Record<string, number> = {};
      (response.data || []).forEach((p: Product) => {
        initialQuantities[p.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('error', 'Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const quantity = quantities[product.id] || 1;
      await addToCart(product.id, quantity);
      showToast('success', `${quantity} ${product.unit} of ${product.vegetable_name} added to cart`);
    } catch (error) {
      showToast('error', 'Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Fresh Vegetables, Direct from Farmers
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8 font-medium">
            Get farm fresh vegetables at fair & transparent prices.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm md:text-base font-semibold">
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> Direct from Verified Farmers
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> Fair & Transparent Prices
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> Freshly Harvested & Delivered
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8 border border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-green-500 focus:border-green-500 transition-colors shadow-inner"
              placeholder="Search for fresh vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <Filter className="w-5 h-5 text-gray-500 ml-2" />
              <select
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
                value={selectedVeg}
                onChange={(e) => setSelectedVeg(e.target.value)}
              >
                <option value="All">All Vegetables</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Onions">Onions</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Carrots">Carrots</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <MapPin className="w-5 h-5 text-gray-500 ml-2" />
              <input
                type="text"
                placeholder="Location..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <select
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer focus:ring-green-500 focus:border-green-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Recommended">Sort: Recommended</option>
              <option value="Price Low to High">Price: Low to High</option>
              <option value="Price High to Low">Price: High to Low</option>
              <option value="Newest">Newest</option>
            </select>

            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${verifiedOnly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${verifiedOnly ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 select-none">Verified Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No produce found"
            message="No fresh produce is currently available matching your criteria. Please check again soon."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer"
                onClick={() => navigate(`/consumer/product/${product.id}`)}
              >
                {/* Image Area */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[0].image_url)}
                      alt={product.vegetable_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200 text-6xl font-bold uppercase">
                      {product.vegetable_name.charAt(0)}
                    </div>
                  )}
                  {product.is_verified === 1 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-green-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-green-100">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-grow" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {product.vegetable_name}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{product.farm_name} • {product.farm_location}</span>
                  </div>
                  
                  <div className="flex items-center text-amber-600 text-sm font-medium mb-4 bg-amber-50 self-start px-2.5 py-1 rounded-md">
                    <Package className="w-4 h-4 mr-1.5" />
                    {product.available_quantity} {product.unit} available
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase font-semibold tracking-wider">Price</p>
                        <PriceDisplay amount={product.current_price} unit={product.unit} className="text-2xl" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <QuantitySelector
                        value={quantities[product.id] || 1}
                        onChange={(val) => handleQuantityChange(product.id, val)}
                        min={1}
                        max={product.available_quantity}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-gray-500">
                        Total: <span className="text-gray-900 font-bold">₹{(product.current_price * (quantities[product.id] || 1)).toFixed(2)}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.available_quantity === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.available_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
