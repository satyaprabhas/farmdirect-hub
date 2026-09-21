import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { 
  ShieldCheck, ShieldAlert, Ban, Eye, Search, CheckCircle2, 
  Clock, Users, Sprout, Building, CreditCard, Phone, MapPin 
} from 'lucide-react';

interface Farmer {
  id: string | number;
  full_name: string;
  username: string;
  mobile_number: string;
  email?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farm_name?: string;
  farm_type?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  produce_count?: number;
  is_verified: number | boolean;
  is_active: number | boolean;
  created_at?: string;
}

const FarmerManagement: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  
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

  const handleVerify = async (farmer: Farmer) => {
    const isCurrentlyVerified = farmer.is_verified === 1 || farmer.is_verified === true;
    try {
      const res = await api.put(`/admin/farmers/${farmer.id}/verify`, { is_verified: !isCurrentlyVerified });
      const newStatus = res.data?.is_verified ? 'APPROVED to sell produce' : 'revoked from selling';
      showToast(
        `Farmer ${farmer.full_name} is now ${newStatus}!`,
        res.data?.is_verified ? 'success' : 'info'
      );
      fetchFarmers();
      if (selectedFarmer && selectedFarmer.id === farmer.id) {
        setSelectedFarmer(prev => prev ? { ...prev, is_verified: res.data?.is_verified ? 1 : 0 } : null);
      }
    } catch (error) {
      showToast('Failed to update farmer selling permission', 'error');
    }
  };

  const handleSuspend = async (farmer: Farmer) => {
    const isCurrentlyActive = farmer.is_active === 1 || farmer.is_active === true;
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/farmers/${farmer.id}/suspend`, { status: newStatus });
      showToast(`Farmer account ${newStatus.toLowerCase()} successfully`, 'success');
      fetchFarmers();
      if (selectedFarmer && selectedFarmer.id === farmer.id) {
        setSelectedFarmer(prev => prev ? { ...prev, is_active: newStatus === 'ACTIVE' ? 1 : 0 } : null);
      }
    } catch (error) {
      showToast('Failed to update farmer account status', 'error');
    }
  };

  const totalCount = farmers.length;
  const verifiedCount = farmers.filter(f => f.is_verified === 1 || f.is_verified === true).length;
  const pendingCount = farmers.filter(f => !f.is_verified || f.is_verified === 0).length;

  const filteredFarmers = farmers.filter(f => {
    const isVerified = f.is_verified === 1 || f.is_verified === true;
    if (activeTab === 'PENDING' && isVerified) return false;
    if (activeTab === 'APPROVED' && !isVerified) return false;

    const term = searchTerm.toLowerCase();
    return (
      f.full_name?.toLowerCase().includes(term) ||
      f.username?.toLowerCase().includes(term) ||
      f.mobile_number?.includes(term) ||
      f.farm_name?.toLowerCase().includes(term) ||
      f.village?.toLowerCase().includes(term) ||
      f.district?.toLowerCase().includes(term)
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'te' ? 'రైతుల నిర్వహణ & అమ్మకాల ఆమోదం' : 'Farmer Management & Selling Approvals'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'te'
              ? 'మార్కెట్‌ప్లేస్‌లో పంటలు విక్రయించడానికి రైతులను ఆమోదించండి. అడ్మిన్ ఆమోదించిన రైతులు మాత్రమే ఉత్పత్తులను విక్రయించగలరు.'
              : 'Approve and authorize farmers to sell in the marketplace. Only admin-approved farmers can list and sell products.'}
          </p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'te' ? 'పేరు, ఫోన్, జిల్లా ద్వారా వెతకండి...' : 'Search by name, phone, district...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-72"
          />
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'మొత్తం రైతులు' : 'Total Farmers'}
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'అమ్మకాలకు ఆమోదించబడినవారు' : 'Approved to Sell (Active)'}
            </p>
            <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'ఆమోదం కోసం వేచి ఉన్నవారు' : 'Pending Selling Approval'}
            </p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Farmers ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Pending Approval</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'PENDING' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'bg-green-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Approved to Sell</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'APPROVED' ? 'bg-green-900 text-white' : 'bg-green-100 text-green-800'
          }`}>
            {verifiedCount}
          </span>
        </button>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Farmer Details</th>
                <th className="px-4 py-3">Farm & Location</th>
                <th className="px-4 py-3 text-center">Listed Produce</th>
                <th className="px-4 py-3 text-center">Selling Permission</th>
                <th className="px-4 py-3 text-center">Account</th>
                <th className="px-4 py-3 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFarmers.map((farmer, index) => {
                const isVerified = farmer.is_verified === 1 || farmer.is_verified === true;
                const isActive = farmer.is_active === 1 || farmer.is_active === true;
                return (
                  <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{farmer.full_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" /> {farmer.mobile_number}
                      </div>
                      <div className="text-[11px] text-gray-400">@{farmer.username}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-400" /> {farmer.farm_name || 'Individual Farm'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" /> {farmer.village || farmer.address || 'N/A'}, {farmer.district || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Sprout className="w-3.5 h-3.5 text-green-600" />
                        {farmer.produce_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold inline-flex items-center gap-1.5 ${
                        isVerified 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            Approved to Sell
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
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick Approve / Revoke Button */}
                        <button
                          onClick={() => handleVerify(farmer)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                            !isVerified
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                          title={!isVerified ? 'Approve farmer to sell produce' : 'Revoke selling permission'}
                        >
                          {!isVerified ? (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Approve to Sell
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                              Revoke Approval
                            </>
                          )}
                        </button>

                        <button 
                          onClick={() => { setSelectedFarmer(farmer); setIsViewModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleSuspend(farmer)} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
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
              {filteredFarmers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No farmers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Profile & Verification Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Farmer Profile & Selling Permission">
        {selectedFarmer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedFarmer.full_name?.charAt(0) || 'F'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedFarmer.full_name}</h3>
                <p className="text-xs text-gray-500">@{selectedFarmer.username} • Registered on {selectedFarmer.created_at ? new Date(selectedFarmer.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2.5 py-1 text-xs rounded-full font-bold inline-flex items-center gap-1 ${
                  (selectedFarmer.is_verified === 1 || selectedFarmer.is_verified === true)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {(selectedFarmer.is_verified === 1 || selectedFarmer.is_verified === true)
                    ? '✓ Approved to Sell'
                    : '⏳ Pending Approval (Cannot Sell)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                <p className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedFarmer.mobile_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="font-medium text-gray-800 mt-0.5">{selectedFarmer.email || 'None provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Farm Name</p>
                <p className="font-semibold text-gray-800 mt-0.5">{selectedFarmer.farm_name || 'Individual Farm'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Farm Type</p>
                <p className="font-medium text-gray-800 mt-0.5">{selectedFarmer.farm_type || 'Traditional Farming'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-medium">Location / Address</p>
                <p className="font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {selectedFarmer.address || selectedFarmer.village || 'N/A'}, {selectedFarmer.district || ''}, {selectedFarmer.state || ''} {selectedFarmer.pincode ? `- ${selectedFarmer.pincode}` : ''}
                </p>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-gray-500" /> Bank & Payment Details
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-gray-500 block">Bank Name</span>
                  <span className="font-semibold text-gray-800">{selectedFarmer.bank_name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Account Number</span>
                  <span className="font-semibold text-gray-800">{selectedFarmer.account_number || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">IFSC Code</span>
                  <span className="font-semibold text-gray-800">{selectedFarmer.ifsc_code || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Account Holder</span>
                  <span className="font-semibold text-gray-800">{selectedFarmer.account_holder_name || selectedFarmer.full_name}</span>
                </div>
              </div>
            </div>

            {/* Selling Permission Toggle inside Modal */}
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase">Selling Status</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {(selectedFarmer.is_verified === 1 || selectedFarmer.is_verified === true)
                    ? 'This farmer is authorized to list products and sell to consumers.'
                    : 'This farmer is NOT authorized to sell produce until you approve them.'}
                </p>
              </div>
              <button
                onClick={() => handleVerify(selectedFarmer)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap ${
                  (selectedFarmer.is_verified === 1 || selectedFarmer.is_verified === true)
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {(selectedFarmer.is_verified === 1 || selectedFarmer.is_verified === true)
                  ? 'Revoke Selling Permission'
                  : '✓ Approve Farmer to Sell Now'}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium"
              >
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
