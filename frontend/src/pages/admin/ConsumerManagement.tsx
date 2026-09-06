import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Eye } from 'lucide-react';

interface Consumer {
  id: string;
  full_name: string;
  mobile_number: string;
  location: string;
  total_orders: number;
  created_at: string;
  status: string;
}

const ConsumerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/consumers');
      setConsumers(response.data);
    } catch (error) {
      showToast('Failed to load consumers', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Consumer Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Total Orders</th>
                <th className="px-4 py-3">Registration Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {consumers.map((consumer, index) => (
                <tr key={consumer.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{consumer.full_name}</td>
                  <td className="px-4 py-3">{consumer.mobile_number}</td>
                  <td className="px-4 py-3">{consumer.location || 'N/A'}</td>
                  <td className="px-4 py-3 text-center font-medium">{consumer.total_orders || 0}</td>
                  <td className="px-4 py-3">{new Date(consumer.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${consumer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {consumer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelectedConsumer(consumer); setIsViewModalOpen(true); }} 
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

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Consumer Details">
        {selectedConsumer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{selectedConsumer.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-900">{selectedConsumer.mobile_number}</p>
              </div>
            </div>
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

export default ConsumerManagement;
