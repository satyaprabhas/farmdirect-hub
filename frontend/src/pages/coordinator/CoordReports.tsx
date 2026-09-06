import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const CoordReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/coordinator/dashboard');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Coordinator Reports</h1>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Delivery Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-sm text-gray-500">Completed Deliveries</p>
            <p className="text-3xl font-bold text-green-600">{stats?.completedOrders || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-sm text-gray-500">Pending Deliveries</p>
            <p className="text-3xl font-bold text-orange-600">{stats?.pendingDeliveries || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Operations Summary</h2>
        <p className="text-gray-600">Total Orders Processed: {stats?.totalOrders || 0}</p>
        <p className="text-gray-600 mt-2">Active Customers: {stats?.totalCustomers || 0}</p>
      </div>
    </div>
  );
};

export default CoordReports;
