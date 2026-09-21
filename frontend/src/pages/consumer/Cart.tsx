import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ShieldAlert, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import QuantitySelector from '../../components/common/QuantitySelector';
import PriceDisplay from '../../components/common/PriceDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const isBulkBuyer = user?.role === 'LARGE_SCALE_CONSUMER';

  const { items, cartTotal, deliveryFee, isLoading, fetchCart, updateCartItem, removeCartItem } = useCart();
  const { t, translateVeg, language } = useLanguage();
  const navigate = useNavigate();

  const minOrder = isBulkBuyer ? 500 : 100;
  const isUnderMin = cartTotal < minOrder;

  const advanceDeposit = Math.round((cartTotal * 0.25) * 100) / 100;
  const remainingAmount = Math.round((cartTotal - advanceDeposit) * 100) / 100;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('cart.yourCart', 'Your Cart')}
        </h1>
        <EmptyState
          icon={ShoppingCart}
          title={t('cart.empty', 'Your cart is empty')}
          message={t('cart.emptyDesc', 'Browse our marketplace to add fresh farm produce to your cart.')}
          actionLabel={t('cart.goToMarketplace', 'Go to Marketplace')}
          onAction={() => navigate(isBulkBuyer ? '/large-scale-consumer' : '/consumer')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('cart.yourCart', 'Your Cart')}
        </h1>
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
          {items.length} {t('cart.itemsCount', 'items')}
        </span>
        {isBulkBuyer && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {t('bulk.badge', 'Wholesale Bulk Buyer')}
          </span>
        )}
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
                          {translateVeg(item.vegetable_name)}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {item.farm_name} • {item.farmer_name}
                        </p>
                        <PriceDisplay price={item.current_price} unit={t(`unit.${item.veg_unit}`, item.veg_unit || 'kg')} size="sm" />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-center gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {t('cart.quantity', 'Quantity')}
                          </span>
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQty: number) => updateCartItem(item.id, newQty)}
                            min={1}
                            max={isBulkBuyer ? item.available_quantity : Math.min(5, item.available_quantity)}
                          />
                          {!isBulkBuyer && item.available_quantity > 5 && (
                            <span className="text-[10px] text-gray-400">Max 5 kg</span>
                          )}
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                            {t('cart.subtotal', 'Subtotal')}
                          </span>
                          <span className="font-bold text-gray-900 text-lg">
                            ₹{(item.current_price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(language === 'te' ? 'ఈ వస్తువును కార్ట్ నుండి తొలగించాలా?' : 'Remove this item from cart?')) {
                              removeCartItem(item.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors ml-2 sm:ml-0 cursor-pointer"
                          title={t('common.remove', 'Remove item')}
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
              <strong className="text-blue-800">{t('cart.fairTradeGuarantee', 'Fair Trade Guarantee:')}</strong> {t('cart.fairTradeDesc', 'Prices are set by FarmDirect Hub admin and are non-negotiable. This ensures farmers receive fair compensation and consumers pay transparent, market-appropriate rates.')}
            </p>
          </div>
        </div>

        {/* Order Summary with 25% Advance Breakdown */}
        <div className="w-full lg:w-96 lg:flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 sticky top-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
              {t('cart.summary', 'Order Summary')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>{t('cart.subtotal', 'Subtotal')} ({items.length} {t('cart.itemsCount', 'items')})</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>{t('cart.deliveryFee', 'Delivery Fee')}</span>
                <span className="text-xs italic">{t('cart.calculatedAtCheckout', 'Calculated at checkout')}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                <span className="text-base font-bold text-gray-900">{t('cart.total', 'Total Value')}</span>
                <span className="text-2xl font-extrabold text-green-700 tracking-tight">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 25% Security Deposit Breakdown Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5 text-xs shadow-sm">
              <div className="flex justify-between items-center font-bold text-amber-950">
                <span className="flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-amber-800" />
                  {t('cart.advanceDeposit', 'Security Deposit (25% Pay Now)')}:
                </span>
                <span className="text-sm font-black text-amber-900">₹{advanceDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-amber-800 font-medium">
                <span>{t('cart.remainingAmount', 'Remaining (75% at Hub/Delivery)')}:</span>
                <span className="font-semibold">₹{remainingAmount.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-amber-800 pt-2 border-t border-amber-200/70 leading-relaxed">
                {t('cart.advanceNote', 'Pay only 25% advance now as security deposit. Pay the remaining 75% upon produce collection.')}
              </p>
            </div>

            {/* Minimum Order Warning if applicable */}
            {isUnderMin && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <span>⚠️ {isBulkBuyer ? t('cart.minBulkOrderNotice', 'Minimum order for Bulk Consumers is ₹500') : t('cart.minHubOrderNotice', 'Minimum order for Hub Pickup is ₹100')}</span>
              </div>
            )}

            <button
              onClick={() => navigate('/consumer/checkout')}
              disabled={isUnderMin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('cart.checkout', 'Proceed to Checkout')}
            </button>

            <p className="text-center text-xs text-gray-400 font-medium">
              {t('cart.secureCheckout', 'Secure checkout • Free cancellation before dispatch')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
