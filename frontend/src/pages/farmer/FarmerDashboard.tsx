import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Package, ClipboardList, CheckCircle, IndianRupee, Plus } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';

interface DashboardData {
  produceCount: number;
  stockSum: number;
  ordersReceived: number;
  completedOrders: number;
  totalEarnings: number;
  recentOrders: any[];
}

const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/farmer/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error('Error fetching farmer dashboard:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Farmer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.full_name}!</p>
        </div>
        <button
          onClick={() => navigate('/farmer/add-produce')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New Produce
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard 
          title="Total Produce" 
          value={data.produceCount.toString()} 
          icon={<Sprout size={24} className="text-green-500" />} 
        />
        <DashboardCard 
          title="Available Stock" 
          value={`${data.stockSum} kg`} 
          icon={<Package size={24} className="text-blue-500" />} 
        />
        <DashboardCard 
          title="Orders Received" 
          value={data.ordersReceived.toString()} 
          icon={<ClipboardList size={24} className="text-purple-500" />} 
        />
        <DashboardCard 
          title="Completed Orders" 
          value={data.completedOrders.toString()} 
          icon={<CheckCircle size={24} className="text-teal-500" />} 
        />
        <DashboardCard 
          title="Total Earnings" 
          value={`₹${data.totalEarnings || 0}`} 
          icon={<IndianRupee size={24} className="text-yellow-500" />} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Orders</h2>
          <Link to="/farmer/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">View All</Link>
        </div>
        
        {data.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-medium">Order #</th>
                  <th className="p-4 font-medium">Produce</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.recentOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{order.vegetable_name}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{order.quantity} {order.unit}</td>
                    <td className="p-4 text-sm font-medium">₹{order.subtotal}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-sm text-gray-500">{new Date(order.placed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState 
              icon={ClipboardList}
              title="No recent orders"
              message="When customers buy your produce, orders will appear here."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
