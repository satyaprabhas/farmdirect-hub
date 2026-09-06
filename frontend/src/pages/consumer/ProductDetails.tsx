import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Package, ShoppingCart, CheckCircle, ShieldCheck } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QuantitySelector from '../../components/common/QuantitySelector';
import PriceDisplay from '../../components/common/PriceDisplay';

interface ProductDetail {
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
  description?: string;
  harvest_date?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      showToast('error', 'Failed to load product details');
      navigate('/consumer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      showToast('success', `${quantity} ${product.unit} added to cart successfully`);
    } catch (error) {
      showToast('error', 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-8">
        <Link to="/consumer" className="hover:text-green-600 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Marketplace
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{product.vegetable_name}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column: Images */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-gray-50 flex flex-col justify-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 shadow-inner relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images[selectedImage].image_url)}
                  alt={product.vegetable_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200 text-8xl font-bold uppercase">
                  {product.vegetable_name.charAt(0)}
                </div>
              )}
              {product.is_verified === 1 && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-green-700 font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-green-100">
                  <ShieldCheck className="w-5 h-5 text-green-500" /> Verified Farmer
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-2 px-1">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === idx ? 'border-green-500 ring-2 ring-green-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img.image_url)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">
            <div className="mb-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {product.vegetable_name}
              </h1>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">{product.farm_name}</p>
                  <p className="text-sm">{product.farm_location}</p>
                </div>
              </div>
              
              <div className="flex items-center text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100 font-medium">
                <Package className="w-5 h-5 mr-3" />
                Available Stock: {product.available_quantity} {product.unit}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                Admin Approved Price
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </p>
              <PriceDisplay price={product.current_price} unit={product.unit} size="lg" />
              <p className="text-sm text-gray-400 mt-2">Prices are set centrally and are non-negotiable to ensure fair trade.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 flex-grow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Quantity ({product.unit})</p>
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={product.available_quantity}
                    className="w-40"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">₹{(product.current_price * quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.available_quantity === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.available_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
