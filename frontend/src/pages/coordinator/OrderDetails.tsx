import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, User, Phone, ArrowLeft, Package } from 'lucide-react';

const STATUS_OPTIONS = [
  'PLACED', 'CONFIRMED', 'PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/coordinator/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        showToast('Failed to load order details', 'error');
        navigate('/coordinator/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;
    try {
      await api.put(`/coordinator/orders/${id}/status`, { status: newStatus });
      showToast('Status updated successfully', 'success');
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/coordinator/orders')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-gray-500">Placed {new Date(order.placed_at).toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {(order.items || []).map((item: any, index: number) => (
              <div key={index} className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.vegetable_name}</p>
                    <p className="text-sm text-gray-500">{item.farm_name} • {item.farmer_location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} {item.unit}</p>
                  <p className="text-sm text-gray-500">₹{item.price_at_purchase} / {item.unit}</p>
                  <p className="font-semibold text-green-700">₹{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{order.delivery_fee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-green-700">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Consumer Info */}
          {order.consumer && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Consumer
              </h3>
              <p className="font-medium text-gray-900">{order.consumer.full_name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-4 h-4" /> {order.consumer.mobile_number}
              </p>
              <p className="text-sm text-gray-500 flex items-start gap-1 mt-1">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> {order.delivery_address}, {order.delivery_village}, {order.delivery_district}, {order.delivery_state} - {order.delivery_pincode}
              </p>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={order.status === status}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    order.status === status 
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-500' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
