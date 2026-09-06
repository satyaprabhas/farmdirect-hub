import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle, Clock, Users, Truck } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DashboardData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalFarmers: number;
  totalCustomers: number;
}

const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          api.get('/coordinator/dashboard'),
          api.get('/coordinator/orders')
        ]);
        setStats(dashRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          className="bg-blue-50"
        />
        <DashboardCard
          title="Completed"
          value={stats?.completedOrders || 0}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          className="bg-green-50"
        />
        <DashboardCard
          title="Pending"
          value={stats?.pendingOrders || 0}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          className="bg-orange-50"
        />
        <DashboardCard
          title="Customers"
          value={stats?.totalCustomers || 0}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          className="bg-purple-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Pre-Booked Orders</h2>
          <Link to="/coordinator/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Consumer</th>
                <th className="p-4 font-medium">Amount (₹)</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{order.order_number}</td>
                  <td className="p-4 text-gray-600">
                    {order.items?.map((item: any) => `${item.vegetable_name} (${item.quantity}${item.unit}) - from ${item.farmer_name || 'Unknown'}`).join(', ')}
                  </td>
                  <td className="p-4 text-gray-600">{order.consumer_name}</td>
                  <td className="p-4 text-gray-600">₹{order.total_amount}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Truck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">No orders assigned yet</p>
                    <p className="text-sm mt-1">When consumers place orders, they will appear here.</p>
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

export default CoordinatorDashboard;
