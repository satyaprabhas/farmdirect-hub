import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_OPTIONS = [
  'PLACED',
  'CONFIRMED',
  'PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

const PreBookedOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { showToast } = useToast();

  const fetchOrders = async (statusFilter = 'All') => {
    setLoading(true);
    try {
      const endpoint = statusFilter === 'All' 
        ? '/coordinator/orders' 
        : `/coordinator/orders?status=${statusFilter}`;
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;
    
    try {
      await api.put(`/coordinator/orders/${orderId}/status`, { status: newStatus });
      showToast('Order status updated successfully', 'success');
      fetchOrders(filter);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const tabs = ['All', 'PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Pre-Booked Orders</h1>
      
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              filter === tab ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'PLACED' ? 'New' : tab === 'OUT_FOR_DELIVERY' ? 'In Transit' : tab === 'All' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order #</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Consumer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-semibold text-gray-900">{order.order_number}</td>
                    <td className="p-4 text-gray-600">
                      {order.items?.map((item: any) => `${item.vegetable_name} (${item.quantity}${item.unit}) - from ${item.farmer_name || 'Unknown'}`).join(', ')}
                    </td>
                    <td className="p-4 text-gray-600">{order.consumer_name}</td>
                    <td className="p-4 font-medium text-gray-900">₹{order.total_amount}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-gray-500">{new Date(order.placed_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Link to={`/coordinator/orders/${order.id}`} className="text-gray-400 hover:text-green-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-green-500 focus:border-green-500"
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <p className="font-medium text-lg mb-1">No orders found</p>
                      <p className="text-sm">Orders matching this filter will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreBookedOrders;
