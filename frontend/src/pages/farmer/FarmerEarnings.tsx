import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import PriceDisplay from '../../components/common/PriceDisplay';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/client';

const FarmerEarnings: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, earningsRes] = await Promise.all([
          api.get('/farmer/dashboard'),
          api.get('/farmer/earnings')
        ]);
        setDashboardData(dashboardRes.data);
        setEarningsData(earningsRes.data || []);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError('Failed to load earnings data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!dashboardData) return null;

  const totalEarnings = dashboardData.totalEarnings || 0;
  const recentOrders = dashboardData.recentOrders || [];

  // Calculate this month and last month earnings from API data
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthStr = lastMonthDate.toISOString().substring(0, 7);

  let thisMonthEarnings = 0;
  let lastMonthEarnings = 0;
  const cropTotals: Record<string, number> = {};

  earningsData.forEach(row => {
    // row has { vegetable_name, month (YYYY-MM), total }
    if (row.month === currentMonthStr) {
      thisMonthEarnings += row.total;
    } else if (row.month === lastMonthStr) {
      lastMonthEarnings += row.total;
    }

    if (!cropTotals[row.vegetable_name]) {
      cropTotals[row.vegetable_name] = 0;
    }
    cropTotals[row.vegetable_name] += row.total;
  });

  const growth = lastMonthEarnings > 0 
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
    : (thisMonthEarnings > 0 ? 100 : 0);

  // Format earnings by crop
  const earningsByCrop = Object.entries(cropTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Earnings</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your revenue and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-green-100 font-medium mb-1">Total Lifetime Earnings</h2>
            <div className="text-4xl md:text-5xl font-bold tracking-tight">
              <PriceDisplay amount={totalEarnings} className="text-white" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-4 text-green-50 bg-white/10 p-3 rounded-lg w-fit backdrop-blur-sm">
            <TrendingUp size={20} />
            <span>Payments are deposited directly to your registered bank account</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <Calendar size={18} />
            <h2 className="font-medium">This Month</h2>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <PriceDisplay amount={thisMonthEarnings} />
          </div>
          <div className={`flex items-center text-sm font-medium ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growth >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(growth).toFixed(1)}% vs last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
          </div>
          
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="p-4 text-sm text-gray-500">{new Date(order.placed_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                        Order {order.order_number}
                      </td>
                      <td className="p-4 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                        +<PriceDisplay amount={order.total_amount} />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Credited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState 
                icon={IndianRupee}
                title="No recent transactions"
                message="When you complete orders, your earnings will appear here."
              />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Earnings by Crop</h2>
          </div>
          <div className="p-6 space-y-6">
            {earningsByCrop.length > 0 ? earningsByCrop.map((crop: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700 dark:text-gray-200">{crop.name}</span>
                  <span className="text-gray-900 dark:text-white"><PriceDisplay amount={crop.amount} /></span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(crop.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center">No crop earnings data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
