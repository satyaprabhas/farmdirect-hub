import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Truck, MapPin, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { items, cartTotal, deliveryFee, clearCart, isLoading: cartLoading, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'HUB_PICKUP'>('HOME_DELIVERY');
  const actualDeliveryFee = deliveryType === 'HUB_PICKUP' ? 0 : deliveryFee;

  const [formData, setFormData] = useState({
    delivery_address: '',
    delivery_village: '',
    delivery_district: '',
    delivery_state: '',
    delivery_pincode: ''
  });

  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data) {
        setFormData({
          delivery_address: res.data.address || '',
          delivery_village: res.data.village || '',
          delivery_district: res.data.district || '',
          delivery_state: res.data.state || '',
          delivery_pincode: res.data.pincode || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile info', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === 'HOME_DELIVERY' && (!formData.delivery_address || !formData.delivery_village || !formData.delivery_district || !formData.delivery_state || !formData.delivery_pincode)) {
      showToast('Please fill all delivery details', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', { ...formData, delivery_type: deliveryType });
      setOrderNumber(res.data.order_number || `FDH-${Math.floor(10000 + Math.random() * 90000)}`);
      await clearCart();
      setSuccess(true);
      showToast('Order placed successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to place order. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center border border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-6 text-lg">Thank you for your purchase.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-2xl font-bold text-green-700">{orderNumber}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/consumer/orders')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/consumer')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 font-bold py-4 rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/consumer/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Delivery Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Option</label>
              <div className="flex gap-4">
                <label className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-colors ${deliveryType === 'HOME_DELIVERY' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'HOME_DELIVERY'} onChange={() => setDeliveryType('HOME_DELIVERY')} className="text-green-600 focus:ring-green-500 w-4 h-4" />
                  <span className={`font-medium ${deliveryType === 'HOME_DELIVERY' ? 'text-green-800' : 'text-gray-700'}`}>Home Delivery</span>
                </label>
                <label className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-colors ${deliveryType === 'HUB_PICKUP' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'HUB_PICKUP'} onChange={() => setDeliveryType('HUB_PICKUP')} className="text-green-600 focus:ring-green-500 w-4 h-4" />
                  <span className={`font-medium ${deliveryType === 'HUB_PICKUP' ? 'text-green-800' : 'text-gray-700'}`}>Hub Pickup</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.full_name || ''}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 focus:ring-0 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="text"
                  readOnly
                  value={user?.mobile_number || ''}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 focus:ring-0 cursor-not-allowed"
                />
              </div>
            </div>

            {deliveryType === 'HOME_DELIVERY' && (
              <>
                <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="delivery_address"
                      value={formData.delivery_address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="House No, Street, Landmark"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Village/City</label>
                      <input
                        type="text"
                        name="delivery_village"
                        value={formData.delivery_village}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input
                        type="text"
                        name="delivery_district"
                        value={formData.delivery_district}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="delivery_state"
                        value={formData.delivery_state}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="delivery_pincode"
                        value={formData.delivery_pincode}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-gray-50 pb-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.vegetable_name}</p>
                    <p className="text-sm text-gray-500">{item.farm_name}</p>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} {item.veg_unit || 'kg'}</p>
                  </div>
                  <div className="text-right font-medium text-gray-900">
                    ₹{(item.current_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>Delivery Fee</span>
                <span>{actualDeliveryFee === 0 ? 'Free (Hub Pickup)' : `₹${actualDeliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-extrabold text-green-600 tracking-tight">
                    ₹{(cartTotal + actualDeliveryFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
              Payment is collected upon delivery (COD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
