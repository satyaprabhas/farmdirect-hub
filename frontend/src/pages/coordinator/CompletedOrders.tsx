import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompletedOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/coordinator/orders?status=DELIVERED');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching completed orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Completed Orders</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Consumer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Date Completed</th>
                <th className="p-4 font-medium">Status</th>
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
                  <td className="p-4 font-medium">₹{order.total_amount}</td>
                  <td className="p-4 text-gray-500">{new Date(order.placed_at).toLocaleDateString()}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4">
                    <Link to={`/coordinator/orders/${order.id}`} className="text-gray-400 hover:text-green-600 transition-colors">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No completed orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompletedOrders;
