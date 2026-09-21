import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Truck, MapPin, CheckCircle2, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { items, cartTotal, deliveryFee, clearCart, isLoading: cartLoading, fetchCart } = useCart();
  const { showToast } = useToast();
  const { t, translateVeg, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [placedAdvance, setPlacedAdvance] = useState(0);
  const [placedRemaining, setPlacedRemaining] = useState(0);
  
  const isBulkBuyer = user?.role === 'LARGE_SCALE_CONSUMER';
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'HUB_PICKUP'>(
    isBulkBuyer ? 'HUB_PICKUP' : 'HUB_PICKUP'
  );

  useEffect(() => {
    if (isBulkBuyer) {
      setDeliveryType('HUB_PICKUP');
    }
  }, [isBulkBuyer]);

  const actualDeliveryFee = deliveryType === 'HUB_PICKUP' ? 0 : deliveryFee;
  const totalAmount = cartTotal + actualDeliveryFee;
  const advanceAmount = Math.round((totalAmount * 0.25) * 100) / 100;
  const remainingAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

  // Minimum order validation checks
  let minOrderError = '';
  if (isBulkBuyer) {
    if (cartTotal < 500) {
      minOrderError = language === 'te' 
        ? 'భారీ వినియోగదారులకు కనీస ఆర్డర్ మొత్తం ₹500 ఉండాలి.' 
        : 'Minimum order amount for Large Scale Consumers is ₹500.';
    }
  } else {
    if (deliveryType === 'HUB_PICKUP' && cartTotal < 100) {
      minOrderError = language === 'te' 
        ? 'హబ్ వద్ద తీసుకోవడానికి కనీస ఆర్డర్ మొత్తం ₹100 ఉండాలి.' 
        : 'Minimum order amount for Hub Pickup is ₹100.';
    } else if (deliveryType === 'HOME_DELIVERY' && cartTotal < 300) {
      minOrderError = language === 'te' 
        ? 'ఇంటి డెలివరీకి కనీస ఆర్డర్ మొత్తం ₹300 ఉండాలి.' 
        : 'Minimum order amount for Home Delivery is ₹300.';
    }
  }

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
    if (minOrderError) {
      showToast(minOrderError, 'error');
      return;
    }

    if (deliveryType === 'HOME_DELIVERY' && (!formData.delivery_address || !formData.delivery_village || !formData.delivery_district || !formData.delivery_state || !formData.delivery_pincode)) {
      showToast(t('cart.fillDetails', 'Please fill all delivery details'), 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', { ...formData, delivery_type: deliveryType });
      setOrderNumber(res.data.order_number || `FDH-${Math.floor(10000 + Math.random() * 90000)}`);
      setPlacedAdvance(advanceAmount);
      setPlacedRemaining(remainingAmount);
      await clearCart();
      setSuccess(true);
      showToast(language === 'te' ? 'ఆర్డర్ విజయవంతంగా నమోదైంది!' : 'Order placed successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || (language === 'te' ? 'ఆర్డర్ నమోదు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Failed to place order. Please try again.');
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {t('cart.orderSuccessTitle', 'Order Placed Successfully!')}
          </h2>
          <p className="text-gray-500 mb-6 text-lg">
            {t('cart.orderSuccessSubtitle', 'Thank you for your purchase.')}
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                {t('cart.orderNumber', 'Order Number')}
              </p>
              <p className="text-2xl font-bold text-green-700">{orderNumber}</p>
            </div>
            
            <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                <span className="text-amber-800 font-semibold block">{language === 'te' ? 'చెల్లించిన అడ్వాన్స్ (25%)' : 'Advance Paid (25%)'}</span>
                <span className="text-sm font-bold text-amber-950">₹{placedAdvance.toFixed(2)}</span>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-left">
                <span className="text-blue-800 font-semibold block">{language === 'te' ? 'హబ్ వద్ద చెల్లించవలసినది (75%)' : 'Due at Hub/Delivery (75%)'}</span>
                <span className="text-sm font-bold text-blue-950">₹{placedRemaining.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/consumer/orders')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md"
            >
              {t('cart.viewOrders', 'View My Orders')}
            </button>
            <button
              onClick={() => navigate('/consumer')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 font-bold py-4 rounded-xl transition-colors"
            >
              {t('cart.continueShopping', 'Continue Shopping')}
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
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        {language === 'te' ? 'ఆర్డర్ నమోదు (చెల్లింపు)' : 'Checkout'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Delivery Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('cart.deliveryInfo', 'Delivery Information')}
              </h2>
            </div>

            <div className="mb-8">
              {isBulkBuyer ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('cart.deliveryType', 'Delivery Option')}
                  </label>
                  <div className="border-2 border-emerald-500 bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" checked readOnly className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <div>
                        <span className="font-bold text-emerald-900 block">
                          {t('cart.hubPickupOption', 'Hub Pickup (Free)')}
                        </span>
                        <span className="text-xs text-emerald-700">
                          {t('bulk.minNotice', 'Wholesale orders must be collected directly from FarmDirect Hub (Min. ₹500).')}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md">
                      Bulk Hub Only
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('cart.deliveryType', 'Select Option')}
                    </label>
                    <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hub Min: ₹100 | Delivery Min: ₹300
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-colors ${deliveryType === 'HUB_PICKUP' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                      <input type="radio" name="deliveryType" checked={deliveryType === 'HUB_PICKUP'} onChange={() => setDeliveryType('HUB_PICKUP')} className="text-green-600 focus:ring-green-500 w-4 h-4" />
                      <div>
                        <span className={`font-bold block ${deliveryType === 'HUB_PICKUP' ? 'text-green-800' : 'text-gray-700'}`}>
                          {t('cart.hubPickupOption', 'Hub Pickup (Free)')}
                        </span>
                        <span className="text-xs text-gray-500">{t('cart.minHubOrderNotice', 'Min order ₹100')}</span>
                      </div>
                    </label>
                    <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-colors ${deliveryType === 'HOME_DELIVERY' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                      <input type="radio" name="deliveryType" checked={deliveryType === 'HOME_DELIVERY'} onChange={() => setDeliveryType('HOME_DELIVERY')} className="text-green-600 focus:ring-green-500 w-4 h-4" />
                      <div>
                        <span className={`font-bold block ${deliveryType === 'HOME_DELIVERY' ? 'text-green-800' : 'text-gray-700'}`}>
                          {t('cart.homeDeliveryOption', 'Home Delivery (₹20)')}
                        </span>
                        <span className="text-xs text-gray-500">{t('cart.minDeliveryOrderNotice', 'Min order ₹300')}</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cart.name', 'Name')}
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.full_name || ''}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 focus:ring-0 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cart.mobile', 'Mobile Number')}
                </label>
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
                <h3 className="font-semibold text-gray-900 mb-4">
                  {t('cart.shippingAddress', 'Shipping Address')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cart.streetAddress', 'Street Address')}
                    </label>
                    <input
                      type="text"
                      name="delivery_address"
                      value={formData.delivery_address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder={language === 'te' ? 'ఇంటి నంబర్, వీధి, ల్యాండ్‌మార్క్' : 'House No, Street, Landmark'}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cart.village', 'Village/City')}
                      </label>
                      <input
                        type="text"
                        name="delivery_village"
                        value={formData.delivery_village}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cart.district', 'District')}
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cart.state', 'State')}
                      </label>
                      <input
                        type="text"
                        name="delivery_state"
                        value={formData.delivery_state}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cart.pincode', 'Pincode')}
                      </label>
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
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              {t('cart.summary', 'Order Summary')}
            </h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-gray-50 pb-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{translateVeg(item.vegetable_name)}</p>
                    <p className="text-sm text-gray-500">{item.farm_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('cart.quantity', 'Qty')}: {item.quantity} {t(`unit.${item.veg_unit}`, item.veg_unit || 'kg')}</p>
                  </div>
                  <div className="text-right font-medium text-gray-900">
                    ₹{(item.current_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl mb-4">
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>{t('cart.subtotal', 'Subtotal')}</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>{t('cart.deliveryFee', 'Delivery Fee')}</span>
                <span>{actualDeliveryFee === 0 ? t('cart.freeHub', 'Free (Hub Pickup)') : `₹${actualDeliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
                <span className="text-sm font-bold text-gray-900">{t('cart.total', 'Total Billed Amount')}</span>
                <span className="text-xl font-extrabold text-gray-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 25% Security Deposit Breakdown */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 mb-4 text-xs shadow-sm">
              <div className="flex justify-between items-center font-bold text-amber-950">
                <span className="text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-800" />
                  {t('cart.advanceDeposit', 'Security Deposit (25% Pay Now)')}:
                </span>
                <span className="text-base font-black text-amber-900">₹{advanceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-amber-800 font-medium">
                <span>{t('cart.remainingAmount', 'Remaining (75% at Hub/Delivery)')}:</span>
                <span className="font-bold">₹{remainingAmount.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-amber-900 pt-2 border-t border-amber-200/80 leading-relaxed">
                <strong>{language === 'te' ? 'చెల్లింపు నిబంధన:' : 'Payment Note:'}</strong> {t('cart.advanceNote', 'Pay only 25% advance now as security deposit. Pay the remaining 75% upon produce collection.')}
              </p>
            </div>

            {/* Minimum Order Warning if applicable */}
            {minOrderError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold mb-4">
                ⚠️ {minOrderError}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !!minOrderError}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  <span>
                    {language === 'te' 
                      ? `25% డిపాజిట్ చెల్లించి బుక్ చేయండి (₹${advanceAmount.toFixed(2)})` 
                      : `Pay 25% Deposit & Book (₹${advanceAmount.toFixed(2)})`}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-3 font-medium">
              {language === 'te' 
                ? 'మిగిలిన 75% మొత్తం పంటను హబ్ వద్ద తీసుకునే సమయంలో చెల్లించవచ్చు.' 
                : 'The remaining 75% balance is payable at the Hub upon collection.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
