import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, ChevronRight } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

interface OrderItem {
  vegetable_name: string;
  quantity: number;
  unit: string;
  price_at_purchase: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['All', 'Active', 'Completed', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['Pending', 'Confirmed', 'Processing', 'Out for Delivery'].includes(order.status);
    if (activeTab === 'Completed') return order.status === 'Delivered';
    if (activeTab === 'Cancelled') return order.status === 'Cancelled';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex overflow-x-auto w-full sm:w-auto mb-8 border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16">
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            message={activeTab === 'All' ? "You haven't placed any orders yet." : `You have no ${activeTab.toLowerCase()} orders.`}
            actionLabel={activeTab === 'All' ? "Start Shopping" : undefined}
            onAction={activeTab === 'All' ? () => navigate('/consumer') : undefined}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="border-b border-gray-100 bg-gray-50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
                  <p className="text-xl font-extrabold text-green-600">₹{order.total_amount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="mb-6 space-y-3">
                  {order.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold uppercase">
                          {(item.vegetable_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.vegetable_name || 'Unknown'}</p>
                          <p className="text-gray-500">Qty: {item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="text-sm text-gray-500 italic mt-2">+ {order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/consumer/orders/${order.id}`)}
                    className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    View Details & Track <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
