import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, ShoppingCart, Truck, Package, 
  ClipboardList, Clock, CheckCircle, IndianRupee 
} from 'lucide-react';

interface DashboardData {
  totalFarmers: number;
  totalConsumers: number;
  totalCoordinators: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  recentOrders: any[];
  topVegetables: any[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total Farmers" 
          value={(data.totalFarmers || 0).toString()} 
          icon={<Users className="w-6 h-6 text-green-600" />} 
          className="bg-green-50"
        />
        <DashboardCard 
          title="Total Consumers" 
          value={(data.totalConsumers || 0).toString()} 
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />} 
          className="bg-blue-50"
        />
        <DashboardCard 
          title="Total Coordinators" 
          value={(data.totalCoordinators || 0).toString()} 
          icon={<Truck className="w-6 h-6 text-purple-600" />} 
          className="bg-purple-50"
        />
        <DashboardCard 
          title="Total Products" 
          value={(data.totalProducts || 0).toString()} 
          icon={<Package className="w-6 h-6 text-orange-600" />} 
          className="bg-orange-50"
        />
        <DashboardCard 
          title="Total Orders" 
          value={(data.totalOrders || 0).toString()} 
          icon={<ClipboardList className="w-6 h-6 text-cyan-600" />} 
          className="bg-cyan-50"
        />
        <DashboardCard 
          title="Pending Orders" 
          value={(data.pendingOrders || 0).toString()} 
          icon={<Clock className="w-6 h-6 text-yellow-600" />} 
          className="bg-yellow-50"
        />
        <DashboardCard 
          title="Completed Orders" 
          value={(data.completedOrders || 0).toString()} 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          className="bg-green-50"
        />
        <DashboardCard 
          title="Total Sales" 
          value={`₹${(data.totalSales || 0).toFixed(2)}`} 
          icon={<IndianRupee className="w-6 h-6 text-emerald-600" />} 
          className="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Consumer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.recentOrders || []).map((order: any) => (
                  <tr key={order.order_number} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3">{order.consumer_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {order.items?.map((item: any) => item.vegetable_name).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      {order.items?.map((item: any) => `${item.quantity}${item.unit}`).join(', ')}
                    </td>
                    <td className="px-4 py-3">₹{order.total_amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">{new Date(order.placed_at || order.created_at || '').toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Vegetables</h2>
          <div className="space-y-4">
            {(data.topVegetables || []).map((veg: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{veg.name}</span>
                </div>
                <span className="text-gray-600">{veg.total_sold || 0} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
