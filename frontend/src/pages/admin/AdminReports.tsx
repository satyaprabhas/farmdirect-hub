import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardCard from '../../components/common/DashboardCard';
import { BarChart as BarIcon, TrendingUp, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#eab308'];

const AdminReports: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports');
      setData(response.data);
    } catch (error) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <LoadingSpinner />;

  const totalRevenue = (data.ordersByDay || []).reduce((s: number, d: any) => s + (d.total || 0), 0);
  const totalOrders = (data.ordersByDay || []).reduce((s: number, d: any) => s + (d.count || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Total Revenue (30d)" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
          className="bg-green-50"
        />
        <DashboardCard 
          title="Total Orders (30d)" 
          value={totalOrders.toString()} 
          icon={<BarIcon className="w-6 h-6 text-blue-600" />} 
          className="bg-blue-50"
        />
        <DashboardCard 
          title="Avg Order Value" 
          value={`₹${avgOrderValue.toLocaleString('en-IN')}`} 
          icon={<PieIcon className="w-6 h-6 text-purple-600" />} 
          className="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Orders by Day (Last 30 Days)</h2>
          {(data.ordersByDay || []).length > 0 ? (
            <div className="space-y-2">
              {(data.ordersByDay || []).map((day: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{day.date}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((day.count / Math.max(...(data.ordersByDay || []).map((d: any) => d.count))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-medium w-12 text-right">{day.count}</span>
                    <span className="text-green-600 font-medium w-20 text-right">₹{day.total}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No order data in the last 30 days</p>
          )}
        </div>

        {/* Vegetable Sales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Sales by Vegetable</h2>
          {(data.vegetableSales || []).length > 0 ? (
            <div className="space-y-3">
              {(data.vegetableSales || []).map((veg: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium text-gray-800">{veg.vegetable_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 text-sm">{veg.quantity} units</span>
                    <span className="ml-4 font-semibold text-gray-900">₹{veg.total}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </div>
      </div>

      {/* Farmer Sales */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Revenue by Farmer</h2>
        {(data.farmerSales || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.farmerSales || []).map((farmer: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-semibold text-gray-900">{farmer.full_name}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{(farmer.total || 0).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No farmer sales data yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
