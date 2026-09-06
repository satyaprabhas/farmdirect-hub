import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Shield, Ban, Eye, Search } from 'lucide-react';

interface Farmer {
  id: string;
  full_name: string;
  mobile_number: string;
  farm_name: string;
  location: string;
  products_listed: number;
  is_verified: boolean;
  status: string;
  bank_details?: string;
}

const FarmerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/farmers');
      setFarmers(response.data);
    } catch (error) {
      showToast('Failed to load farmers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/farmers/${id}/verify`, { is_verified: !currentStatus });
      showToast(`Farmer ${!currentStatus ? 'verified' : 'unverified'} successfully`, 'success');
      fetchFarmers();
    } catch (error) {
      showToast('Failed to update verification status', 'error');
    }
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/farmers/${id}/suspend`, { status: newStatus });
      showToast(`Farmer account ${newStatus.toLowerCase()} successfully`, 'success');
      fetchFarmers();
    } catch (error) {
      showToast('Failed to update account status', 'error');
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search farmers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Farm Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Products Listed</th>
                <th className="px-4 py-3 text-center">Verification</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFarmers.map((farmer, index) => (
                <tr key={farmer.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{farmer.full_name}</td>
                  <td className="px-4 py-3">{farmer.mobile_number}</td>
                  <td className="px-4 py-3">{farmer.farm_name}</td>
                  <td className="px-4 py-3">{farmer.location}</td>
                  <td className="px-4 py-3 text-center font-medium">{farmer.products_listed || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${farmer.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {farmer.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${farmer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => { setSelectedFarmer(farmer); setIsViewModalOpen(true); }} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleVerify(farmer.id, farmer.is_verified)} 
                        className={`p-1.5 rounded-lg transition-colors ${farmer.is_verified ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} 
                        title={farmer.is_verified ? 'Unverify' : 'Verify'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSuspend(farmer.id, farmer.status)} 
                        className={`p-1.5 rounded-lg transition-colors ${farmer.status === 'ACTIVE' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} 
                        title={farmer.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Farmer Details">
        {selectedFarmer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{selectedFarmer.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-900">{selectedFarmer.mobile_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Farm Name</p>
                <p className="font-medium text-gray-900">{selectedFarmer.farm_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{selectedFarmer.location}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Bank Details (if provided)</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg text-gray-700">
                {selectedFarmer.bank_details || 'No bank details provided yet.'}
              </p>
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

export default FarmerManagement;
