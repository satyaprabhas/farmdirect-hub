import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import QuantitySelector from '../../components/common/QuantitySelector';
import PriceDisplay from '../../components/common/PriceDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Cart() {
  const { items, cartTotal, deliveryFee, isLoading, fetchCart, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Browse our marketplace to add fresh farm produce to your cart."
          actionLabel="Go to Marketplace"
          onAction={() => navigate('/consumer')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Cart</h1>
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
          {items.length} items
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <li key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Thumbnail */}
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-200">
                      <div className="h-full w-full flex items-center justify-center bg-green-50 text-green-200 text-3xl font-bold uppercase">
                        {(item.vegetable_name || '?').charAt(0)}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {item.vegetable_name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {item.farm_name} • {item.farmer_name}
                        </p>
                        <PriceDisplay price={item.current_price} unit={item.veg_unit || 'kg'} size="sm" />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-center gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Quantity</span>
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQty: number) => updateCartItem(item.id, newQty)}
                            min={1}
                            max={item.available_quantity}
                          />
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Subtotal</span>
                          <span className="font-bold text-gray-900 text-lg">
                            ₹{(item.current_price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm('Remove this item from cart?')) {
                              removeCartItem(item.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors ml-2 sm:ml-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 flex items-start gap-3 text-sm text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <ShieldAlert className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-blue-800">Fair Trade Guarantee:</strong> Prices are set by FarmDirect Hub admin and are non-negotiable. This ensures farmers receive fair compensation and consumers pay transparent, market-appropriate rates.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 lg:flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Delivery Fee</span>
                <span className="text-sm italic">Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-extrabold text-green-600 tracking-tight">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">+ Delivery charges if applicable</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/consumer/checkout')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-green-500/30 focus:ring-4 focus:ring-green-500/50"
            >
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
              Secure checkout • Free cancellation before dispatch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
