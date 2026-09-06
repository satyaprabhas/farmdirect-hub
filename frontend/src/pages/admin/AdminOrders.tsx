import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Eye, Search } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  consumer_name: string;
  total_amount: number;
  items?: any[];
  status: string;
  created_at?: string;
  placed_at?: string;
}

const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const response = await api.get('/admin/orders', { params });
      setOrders(response.data);
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const orderNumMatch = (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const consumerMatch = (o.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const itemsMatch = o.items && o.items.some((item: any) => 
      (item.farmer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vegetable_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return orderNumMatch || consumerMatch || itemsMatch;
  });

  if (loading && orders.length === 0) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 w-full sm:w-48"
          >
            <option value="All">All Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="PICKUP">PICKUP</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <div className="hidden sm:block text-gray-400 text-sm italic self-center">Date Range (Coming Soon)</div>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Consumer</th>
                <th className="px-4 py-3">Farmer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-4 py-3">{order.consumer_name}</td>
                  <td className="px-4 py-3">
                    {order.items?.map((item: any) => item.farmer_name || 'Unknown').join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    {order.items?.map((item: any) => item.vegetable_name).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    {order.items?.map((item: any) => `${item.quantity}${item.unit}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">₹{order.total_amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">{new Date(order.placed_at || order.created_at || '').toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Order ${selectedOrder?.order_number}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <p>Details for order {selectedOrder.order_number}</p>
            <div className="pt-4 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
