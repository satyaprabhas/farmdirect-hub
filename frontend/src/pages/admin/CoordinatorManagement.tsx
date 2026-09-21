import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Shield, Ban, Eye, Search, CheckCircle2, Clock, Users, MapPin, Phone, Mail } from 'lucide-react';

interface Coordinator {
  id: string | number;
  full_name: string;
  username: string;
  mobile_number: string;
  email?: string;
  location?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  is_verified: number | boolean;
  is_active: number | boolean;
  assigned_orders?: number;
  completed_orders?: number;
}

const CoordinatorManagement: React.FC = () => {
  const { showToast } = useToast();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);

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

  const handleVerify = async (id: string | number, currentStatus: number | boolean) => {
    const isCurrentlyVerified = !!currentStatus;
    try {
      const res = await api.put(`/admin/coordinators/${id}/verify`, { is_verified: !isCurrentlyVerified });
      const newStatus = res.data?.is_verified ? 'approved' : 'approval revoked';
      showToast(`Coordinator ${newStatus} successfully`, 'success');
      fetchCoordinators();
    } catch (error) {
      showToast('Failed to update coordinator verification status', 'error');
    }
  };

  const handleSuspend = async (id: string | number, currentActive: number | boolean) => {
    const isCurrentlyActive = currentActive === 1 || currentActive === true;
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/coordinators/${id}/suspend`, { status: newStatus });
      showToast(`Coordinator account ${newStatus.toLowerCase()} successfully`, 'success');
      fetchCoordinators();
    } catch (error) {
      showToast('Failed to update coordinator account status', 'error');
    }
  };

  const filteredCoordinators = coordinators.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile_number?.includes(searchTerm) ||
    c.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = coordinators.length;
  const verifiedCount = coordinators.filter(c => !!c.is_verified).length;
  const pendingCount = coordinators.filter(c => !c.is_verified).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Management</h1>
          <p className="text-sm text-gray-500 mt-1">Approve and verify coordinators to manage order logistics and regional hubs</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-72"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Coordinators</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Approved (Active)</p>
            <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Coordinators Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Coordinator Name</th>
                <th className="px-4 py-3">Mobile & District</th>
                <th className="px-4 py-3 text-center">Orders Handled</th>
                <th className="px-4 py-3 text-center">Admin Approval</th>
                <th className="px-4 py-3 text-center">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoordinators.map((coord, index) => {
                const isVerified = !!coord.is_verified;
                const isActive = coord.is_active === 1 || coord.is_active === true;
                return (
                  <tr key={coord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{coord.full_name}</div>
                      <div className="text-xs text-gray-400">@{coord.username}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{coord.mobile_number}</div>
                      <div className="text-xs text-gray-500">{coord.district || coord.location || 'N/A'}, {coord.state || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className="text-gray-900 font-semibold">{coord.assigned_orders || 0}</span>
                      <span className="text-xs text-gray-400 block">({coord.completed_orders || 0} completed)</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1 ${
                        isVerified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            Approved
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Approval
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => { setSelectedCoordinator(coord); setIsViewModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleVerify(coord.id, coord.is_verified)} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            isVerified 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`} 
                          title={isVerified ? 'Revoke Approval' : 'Approve Coordinator'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSuspend(coord.id, coord.is_active)} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`} 
                          title={isActive ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCoordinators.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No coordinators found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Coordinator Profile & Logistics Info">
        {selectedCoordinator && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedCoordinator.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedCoordinator.full_name}</h3>
                <p className="text-xs text-gray-500">Registered on {new Date(selectedCoordinator.created_at).toLocaleDateString()}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                  !!selectedCoordinator.is_verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {!!selectedCoordinator.is_verified ? 'Verified & Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium">Username</p>
                <p className="font-semibold text-gray-800 mt-0.5">@{selectedCoordinator.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                <p className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedCoordinator.mobile_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedCoordinator.email || 'None provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Assigned Hub / Location</p>
                <p className="font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {selectedCoordinator.district || selectedCoordinator.location || 'All Hubs'}, {selectedCoordinator.state || ''}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Logistics Performance</h4>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block">Total Orders Coordinated</span>
                  <span className="text-lg font-bold text-gray-900">{selectedCoordinator.assigned_orders || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-500 block">Delivered Orders</span>
                  <span className="text-lg font-bold text-green-600">{selectedCoordinator.completed_orders || 0}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button 
                onClick={() => {
                  handleVerify(selectedCoordinator.id, selectedCoordinator.is_verified);
                  setIsViewModalOpen(false);
                }} 
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  !!selectedCoordinator.is_verified 
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {!!selectedCoordinator.is_verified ? 'Revoke Approval' : 'Approve Coordinator Now'}
              </button>
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoordinatorManagement;
