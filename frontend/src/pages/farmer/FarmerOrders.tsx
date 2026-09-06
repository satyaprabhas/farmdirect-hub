import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';
import Modal from '../../components/common/Modal';
import OrderTimeline from '../../components/common/OrderTimeline';

const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/farmer/orders');
        setOrders(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getProductNames = (order: any) => (order.items || []).map((i: any) => i.vegetable_name).join(', ') || 'N/A';

  const filteredOrders = orders.filter(order => 
    (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    getProductNames(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-300">Track and manage orders for your produce</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Crop or Consumer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter size={18} /> Filter
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8">
            <EmptyState 
              icon={ClipboardList}
              title="No orders found"
              message={searchTerm ? "No orders match your search." : "You haven't received any orders yet."}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-medium">Order #</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Produce</th>
                  <th className="p-4 font-medium">Consumer</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(order.placed_at).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{getProductNames(order)}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{order.consumer_name || 'Customer'}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{(order.items || []).reduce((s: number, i: any) => s + i.quantity, 0)} {order.items?.[0]?.unit || 'kg'}</td>
                    <td className="p-4 text-sm font-medium text-green-600 dark:text-green-400">
                      ₹{order.total_amount}
                    </td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Produce</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{getProductNames(selectedOrder)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{(selectedOrder.items || []).reduce((s: number, i: any) => s + i.quantity, 0)} {selectedOrder.items?.[0]?.unit || 'kg'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-green-600 dark:text-green-400 text-xl">₹{selectedOrder.total_amount}</p>
                <div className="mt-1"><StatusBadge status={selectedOrder.status} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2 mb-4">Order Timeline</h3>
              <OrderTimeline currentStatus={selectedOrder.status} />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Next Steps</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {selectedOrder.status === 'Pending' ? 'Please prepare the produce. A logistics partner will be assigned soon.' :
                 selectedOrder.status === 'Confirmed' ? 'Prepare produce for pickup.' :
                 selectedOrder.status === 'Shipped' ? 'Produce is on the way to the consumer.' :
                 'Order has been completed. Payment will be credited to your account.'}
              </p>
            </div>
            
            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FarmerOrders;
