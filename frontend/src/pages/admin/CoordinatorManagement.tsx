import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Coordinator {
  id: string;
  full_name: string;
  mobile_number: string;
  location: string;
  created_at: string;
  status: string;
}

const CoordinatorManagement: React.FC = () => {
  const { showToast } = useToast();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/coordinators');
      setCoordinators(response.data);
    } catch (error) {
      showToast('Failed to load coordinators', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coordinator Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Registration Date</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coordinators.map((coordinator, index) => (
                <tr key={coordinator.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{coordinator.full_name}</td>
                  <td className="px-4 py-3">{coordinator.mobile_number}</td>
                  <td className="px-4 py-3">{coordinator.location || 'N/A'}</td>
                  <td className="px-4 py-3">{new Date(coordinator.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${coordinator.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coordinator.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorManagement;
