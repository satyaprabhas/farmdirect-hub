import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Package, ShoppingCart, CheckCircle, Filter, Building2, CreditCard, Info } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import QuantitySelector from '../../components/common/QuantitySelector';
import PriceDisplay from '../../components/common/PriceDisplay';

import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const isBulkBuyer = user?.role === 'LARGE_SCALE_CONSUMER';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVeg, setSelectedVeg] = useState('All');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('Recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [vegetableOptions, setVegetableOptions] = useState<string[]>([]);
  
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { t, translateVeg, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products/vegetables')
      .then(res => {
        const names = (res.data || []).map((v: any) => v.name);
        if (names.length > 0) setVegetableOptions(names);
      })
      .catch(() => {
        setVegetableOptions([
          'Tomatoes', 'Ladies Finger', 'Cucumbers', 'Spinach', 'Bottle Gourd', 
          'Carrots', 'Brinjal', 'Potatoes', 'Onions', 'Ridge Gourd', 
          'Bitter Gourd', 'Tindora', 'Cauliflower', 'Beans', 'Drumstick'
        ]);
      });
  }, []);

  useEffect(() => {
    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts(true);
    }, 10000);

    const handleFocus = () => {
      fetchProducts(true);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [searchQuery, selectedVeg, location, sortBy, verifiedOnly]);

  const fetchProducts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedVeg !== 'All') params.append('vegetable', selectedVeg);
      if (location) params.append('location', location);
      params.append('sort', sortBy);
      if (verifiedOnly) params.append('verified', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data || []);
      
      setQuantities(prev => {
        const next = { ...prev };
        (response.data || []).forEach((p: Product) => {
          if (!next[p.id]) next[p.id] = 1;
        });
        return next;
      });
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch products:', error);
        showToast('error', language === 'te' ? 'కూరగాయల జాబితా లోడ్ కాలేదు' : 'Failed to load marketplace data');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const quantity = quantities[product.id] || 1;
      await addToCart(product.id, quantity);
      const vegName = translateVeg(product.vegetable_name);
      const unitLabel = t(`unit.${product.unit}`, product.unit);
      showToast('success', language === 'te' ? `${vegName} (${quantity} ${unitLabel}) కార్ట్‌కు చేర్చబడింది` : `${quantity} ${product.unit} of ${product.vegetable_name} added to cart`);
    } catch (error) {
      showToast('error', language === 'te' ? 'కార్ట్‌కు జోడించడం విఫలమైంది' : 'Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            {language === 'te' ? 'రైతుల నుండి నేరుగా తాజా కూరగాయలు' : 'Fresh Vegetables, Direct from Farmers'}
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8 font-medium">
            {language === 'te' ? 'ప్రభుత్వ గిట్టుబాటు ధరలతో నాణ్యమైన తాజా కూరగాయలను పొందండి.' : 'Get farm fresh vegetables at fair & transparent prices.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm md:text-base font-semibold">
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> {language === 'te' ? 'ధృవీకరించబడిన రైతుల నుండి' : 'Direct from Verified Farmers'}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> {language === 'te' ? 'గిట్టుబాటు & పారదర్శక ధరలు' : 'Fair & Transparent Prices'}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" /> {language === 'te' ? 'తాజాగా కోసిన పంటల డెలివరీ' : 'Freshly Harvested & Delivered'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-6">
        {/* Order Policy & Deposit Banner */}
        {isBulkBuyer ? (
          <div className="bg-emerald-50 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-sm text-emerald-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-emerald-950 text-base">
                      {language === 'te' ? 'హోల్‌సేల్ / బల్క్ కొనుగోలు నిబంధనలు' : 'Wholesale Bulk Order Policy'}
                    </h3>
                    <span className="font-bold text-emerald-900 uppercase tracking-wide text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md">
                      {t('bulk.badge', 'Wholesale Bulk Buyer')}
                    </span>
                  </div>
                  <p className="text-emerald-800 text-xs mt-0.5 font-medium">
                    {t('bulk.minNotice', 'Minimum order ₹500. Bulk orders must be collected directly from the FarmDirect Hub.')}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-200/80 text-emerald-900 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto">
                {language === 'te' ? 'కనీస ఆర్డర్: ₹500 (హబ్ పికప్)' : 'Min. Order: ₹500 (Hub Pickup)'}
              </span>
            </div>
            <div className="pt-3 flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>{language === 'te' ? 'భద్రతా డిపాజిట్ (25%):' : 'Advance Payment:'}</strong>{' '}
                {t('cart.advanceNote', 'Pay only 25% advance now as security deposit. Pay the remaining 75% upon produce collection.')}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm text-amber-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 text-base">
                    {language === 'te' ? 'ముఖ్య గమనిక (ఆర్డర్ నిబంధనలు):' : 'Important Order Policy & Notes:'}
                  </h3>
                  <p className="text-amber-800 text-xs font-medium mt-0.5">
                    {language === 'te' ? 'రైతులకు న్యాయమైన ధర మరియు పారదర్శకత కోసం ఈ నిబంధనలు వర్తిస్తాయి' : 'Fair trade transparency & guaranteed stock allocation policies'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-200/90 text-amber-900 font-semibold px-2.5 py-1 rounded-full text-xs">
                  {t('cart.minHubOrderNotice', 'Minimum order for Hub Pickup: ₹100')}
                </span>
                <span className="bg-amber-200/90 text-amber-900 font-semibold px-2.5 py-1 rounded-full text-xs">
                  {t('cart.minDeliveryOrderNotice', 'Minimum order for Home Delivery: ₹300')}
                </span>
                <span className="bg-amber-200/90 text-amber-900 font-semibold px-2.5 py-1 rounded-full text-xs">
                  {language === 'te' ? 'రిటైల్ గరిష్ట పరిమితి: కూరగాయకు 5 కేజీలు' : 'Retail limit: max 5 kg per item'}
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-2 text-xs text-amber-900 font-medium">
              <CreditCard className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                <strong>{t('cart.advanceDeposit', 'Security Deposit (25% Pay Now)')}:</strong>{' '}
                {t('cart.advanceNote', 'Pay only 25% advance now as security deposit. Pay the remaining 75% upon produce collection.')}
              </span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8 border border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-green-500 focus:border-green-500 transition-colors shadow-inner"
              placeholder={t('market.searchPlaceholder', 'Search for fresh vegetables...')}
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
                <option value="All">{t('market.allVegetables', 'All Vegetables')}</option>
                {(vegetableOptions.length > 0 ? vegetableOptions : [
                  'Tomatoes', 'Ladies Finger', 'Cucumbers', 'Spinach', 'Bottle Gourd', 
                  'Carrots', 'Brinjal', 'Potatoes', 'Onions', 'Ridge Gourd', 
                  'Bitter Gourd', 'Tindora', 'Cauliflower', 'Beans', 'Drumstick'
                ]).map(name => (
                  <option key={name} value={name}>{translateVeg(name)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <MapPin className="w-5 h-5 text-gray-500 ml-2" />
              <input
                type="text"
                placeholder={language === 'te' ? 'ప్రాంతం...' : 'Location...'}
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
              <option value="Recommended">{t('market.recommended', 'Sort: Recommended')}</option>
              <option value="Price Low to High">{t('market.priceLowHigh', 'Price: Low to High')}</option>
              <option value="Price High to Low">{t('market.priceHighLow', 'Price: High to Low')}</option>
              <option value="Newest">{language === 'te' ? 'సరికొత్తవి' : 'Newest'}</option>
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
              <span className="text-sm font-semibold text-gray-700 select-none">
                {t('market.verifiedOnly', 'Verified Only')}
              </span>
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
            title={language === 'te' ? 'కూరగాయలు అందుబాటులో లేవు' : 'No produce found'}
            message={language === 'te' ? 'మీ శోధనకు తగిన తాజా కూరగాయలు ప్రస్తుతానికి అందుబాటులో లేవు. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.' : 'No fresh produce is currently available matching your criteria. Please check again soon.'}
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
                      alt={translateVeg(product.vegetable_name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200 text-6xl font-bold uppercase">
                      {product.vegetable_name.charAt(0)}
                    </div>
                  )}
                  {product.is_verified === 1 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-green-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-green-100">
                      <CheckCircle className="w-3.5 h-3.5" /> {language === 'te' ? 'ధృవీకరించబడింది' : 'Verified'}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-grow" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {translateVeg(product.vegetable_name)}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{product.farm_name} • {product.farm_location}</span>
                  </div>
                  
                  <div className="flex items-center text-amber-600 text-sm font-medium mb-4 bg-amber-50 self-start px-2.5 py-1 rounded-md">
                    <Package className="w-4 h-4 mr-1.5" />
                    {product.available_quantity} {t(`unit.${product.unit}`, product.unit)} {language === 'te' ? 'అందుబాటులో ఉంది' : 'available'}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase font-semibold tracking-wider">
                          {language === 'te' ? 'ధర' : 'Price'}
                        </p>
                        <PriceDisplay amount={product.current_price} unit={product.unit} className="text-2xl" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <QuantitySelector
                        value={quantities[product.id] || 1}
                        onChange={(val) => handleQuantityChange(product.id, val)}
                        min={1}
                        max={isBulkBuyer ? product.available_quantity : Math.min(5, product.available_quantity)}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-gray-500">
                        {language === 'te' ? 'మొత్తం:' : 'Total:'} <span className="text-gray-900 font-bold">₹{(product.current_price * (quantities[product.id] || 1)).toFixed(2)}</span>
                      </span>
                    </div>
                    {!isBulkBuyer && product.available_quantity > 5 && (
                      <p className="text-[11px] text-gray-400 mb-3 font-medium">
                        {language === 'te' ? 'రిటైల్ వినియోగదారు పరిమితి: గరిష్టంగా 5 కేజీలు' : 'Retail limit: max 5 kg per item'}
                      </p>
                    )}

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.available_quantity === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.available_quantity === 0 ? (language === 'te' ? 'స్టాక్ అయిపోయింది' : 'Out of Stock') : t('market.addToCart', 'Add to Cart')}
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
