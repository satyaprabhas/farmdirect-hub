import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Package, CreditCard, Phone, User } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderTimeline from '../../components/common/OrderTimeline';
import { useToast } from '../../context/ToastContext';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to fetch order details');
      navigate('/consumer/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-8">
        <Link to="/consumer/orders" className="hover:text-green-600 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          My Orders
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{order.order_number}</span>
      </nav>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-500 font-medium">Order #{order.order_number}</p>
        </div>
        <StatusBadge status={order.status} className="text-lg px-4 py-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Timeline & Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline Tracking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Tracking Status</h2>
            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Items in Order
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold text-lg uppercase">
                      {item.vegetable_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.vegetable_name}</p>
                      <p className="text-sm text-gray-500">{item.farm_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{item.quantity} {item.unit} @ ₹{item.price_at_purchase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Details & Summary */}
        <div className="space-y-6">
          
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment Summary
            </h2>
            <div className="space-y-3 mb-4 text-sm font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(order.total_amount - 20).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹20.00</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="text-2xl font-extrabold text-green-600">₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-500 font-semibold">
              Payment Method: Cash on Delivery
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Delivery Details
            </h2>
            <address className="not-italic text-sm text-gray-600 space-y-1 font-medium leading-relaxed">
              <p className="text-gray-900 font-bold mb-1">{order.consumer_name}</p>
              <p>{order.delivery_address}</p>
              <p>{order.delivery_village}, {order.delivery_district}</p>
              <p>{order.delivery_state} - {order.delivery_pincode}</p>
            </address>
          </div>

          {/* Coordinator Info (if assigned) */}
          {order.coordinator_name && (
            <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
              <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" /> Delivery Coordinator
              </h2>
              <div className="space-y-2 text-sm text-green-800">
                <p className="font-bold text-base">{order.coordinator_name}</p>
                {order.coordinator_phone && (
                  <a href={`tel:${order.coordinator_phone}`} className="flex items-center gap-2 hover:text-green-600 font-medium bg-white px-3 py-2 rounded-lg shadow-sm border border-green-50 w-max">
                    <Phone className="w-4 h-4" /> {order.coordinator_phone}
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
