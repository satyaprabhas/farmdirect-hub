import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { GraduationCap, ShieldCheck, ShieldAlert, Ban, Eye, Search, CheckCircle, Clock, MapPin, Award } from 'lucide-react';

interface Adviser {
  id: number;
  full_name: string;
  username: string;
  mobile_number: string;
  email?: string;
  district?: string;
  state?: string;
  is_active: number;
  is_verified: number;
  specialization?: string;
  qualification?: string;
  license_number?: string;
  experience_years?: number;
  bio?: string;
  resolved_cases: number;
  pending_cases: number;
}

const AdviserManagement: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [advisers, setAdvisers] = useState<Adviser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAdviser, setSelectedAdviser] = useState<Adviser | null>(null);

  useEffect(() => {
    fetchAdvisers();
  }, []);

  const fetchAdvisers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/advisers');
      setAdvisers(response.data || []);
    } catch (error) {
      showToast('Failed to load advisers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, currentStatus: number) => {
    try {
      await api.put(`/admin/advisers/${id}/verify`);
      showToast(
        currentStatus === 1
          ? (language === 'te' ? 'సలహాదారు ఆమోదం ఉపసంహరించబడింది' : 'Adviser approval revoked')
          : (language === 'te' ? 'వ్యవసాయ సలహాదారు విజయవంతంగా ఆమోదించబడ్డారు!' : 'Adviser approved & verified successfully!'),
        'success'
      );
      fetchAdvisers();
    } catch (error) {
      showToast('Failed to update verification status', 'error');
    }
  };

  const handleSuspend = async (id: number, currentStatus: number) => {
    try {
      await api.put(`/admin/advisers/${id}/suspend`);
      showToast(
        currentStatus === 1
          ? (language === 'te' ? 'సలహాదారు ఖాతా సస్పెండ్ చేయబడింది' : 'Adviser account suspended')
          : (language === 'te' ? 'సలహాదారు ఖాతా పునరుద్ధరించబడింది' : 'Adviser account activated'),
        'success'
      );
      fetchAdvisers();
    } catch (error) {
      showToast('Failed to update account status', 'error');
    }
  };

  const filteredAdvisers = advisers.filter(a => 
    (a.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.license_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-purple-600" />
            {language === 'te' ? 'వ్యవసాయ సలహాదారుల నిర్వహణ' : 'Agricultural Adviser Management'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'te' 
              ? 'సలహాదారుల అర్హతలను పరిశీలించి ఆమోదించండి. అడ్మిన్ ఆమోదం పొందిన సలహాదారులు మాత్రమే రైతులకు సలహా ఇవ్వగలరు.' 
              : 'Verify & approve certified advisers. Only approved advisers are authorized to prescribe treatments to farmers.'}
          </p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'te' ? 'సలహాదారులను శోధించండి...' : 'Search advisers by name, license...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-72 text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'మొత్తం సలహాదారులు' : 'Total Advisers'}
            </span>
            <div className="text-2xl font-black text-purple-700 mt-1">{advisers.length}</div>
          </div>
          <GraduationCap className="w-8 h-8 text-purple-400" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'ఆమోదించబడినవారు' : 'Verified & Approved'}
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {advisers.filter(a => a.is_verified === 1).length}
            </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">
              {language === 'te' ? 'ఆమోదం కొరకు పెండింగ్' : 'Pending Approval'}
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {advisers.filter(a => a.is_verified !== 1).length}
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{language === 'te' ? 'పేరు & వివరాలు' : 'Adviser Name'}</th>
                <th className="px-4 py-3">{language === 'te' ? 'ప్రత్యేకత & అర్హత' : 'Specialization & Degree'}</th>
                <th className="px-4 py-3">{language === 'te' ? 'లైసెన్స్ నంబర్' : 'License / Reg No'}</th>
                <th className="px-4 py-3">{language === 'te' ? 'ప్రాంతం' : 'Location'}</th>
                <th className="px-4 py-3 text-center">{language === 'te' ? 'పరిష్కరించిన కేసులు' : 'Resolved Cases'}</th>
                <th className="px-4 py-3 text-center">{language === 'te' ? 'ఆమోద స్థితి' : 'Admin Approval'}</th>
                <th className="px-4 py-3 text-center">{language === 'te' ? 'ఖాతా స్థితి' : 'Account Status'}</th>
                <th className="px-4 py-3 text-center">{language === 'te' ? 'చర్యలు' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdvisers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    {language === 'te' ? 'ఎటువంటి సలహాదారులు కనుగొనబడలేదు.' : 'No advisers found.'}
                  </td>
                </tr>
              ) : (
                filteredAdvisers.map((adviser, index) => (
                  <tr key={adviser.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{adviser.full_name}</div>
                      <div className="text-xs text-gray-400">{adviser.mobile_number} • {adviser.email || `@${adviser.username}`}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-purple-900 text-xs">{adviser.specialization || 'General Agronomy'}</div>
                      <div className="text-[11px] text-gray-500">{adviser.qualification || 'M.Sc Agriculture'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {adviser.license_number || 'N/A'}
                      </span>
                      {adviser.experience_years ? (
                        <div className="text-[11px] text-gray-400 mt-0.5">{adviser.experience_years} yrs exp</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{adviser.district ? `${adviser.district}, ${adviser.state}` : 'Andhra Pradesh'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                        {adviser.resolved_cases || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleVerify(adviser.id, adviser.is_verified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-sm ${
                          adviser.is_verified === 1
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 animate-pulse'
                        }`}
                        title={adviser.is_verified === 1 ? 'Click to revoke approval' : 'Click to approve adviser'}
                      >
                        {adviser.is_verified === 1 ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'te' ? 'ఆమోదించబడింది' : 'Approved'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'te' ? 'ఆమోదించండి' : 'Approve Now'}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        adviser.is_active === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {adviser.is_active === 1 ? (language === 'te' ? 'యాక్టివ్' : 'Active') : (language === 'te' ? 'సస్పెండ్' : 'Suspended')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdviser(adviser);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspend(adviser.id, adviser.is_active)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            adviser.is_active === 1
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={adviser.is_active === 1 ? 'Suspend account' : 'Activate account'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAdviser && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={language === 'te' ? 'సలహాదారు ప్రొఫైల్ వివరాలు' : 'Adviser Profile & Credentials'}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selectedAdviser.full_name}</h3>
                <p className="text-xs text-purple-700 font-medium">
                  {selectedAdviser.specialization || 'Agronomy Specialist'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedAdviser.is_verified === 1 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {selectedAdviser.is_verified === 1 ? 'Admin Approved' : 'Pending Approval'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    ID: {selectedAdviser.license_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Mobile Number</span>
                <span className="font-semibold text-gray-800">{selectedAdviser.mobile_number}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Email Address</span>
                <span className="font-semibold text-gray-800">{selectedAdviser.email || 'N/A'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Qualification</span>
                <span className="font-semibold text-gray-800">{selectedAdviser.qualification || 'N/A'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block mb-0.5">Experience</span>
                <span className="font-semibold text-gray-800">{selectedAdviser.experience_years ? `${selectedAdviser.experience_years} Years` : 'N/A'}</span>
              </div>
            </div>

            {selectedAdviser.bio && (
              <div className="p-3.5 bg-gray-50 rounded-xl text-xs">
                <span className="text-gray-500 font-bold block mb-1 uppercase text-[10px]">Professional Background & Bio</span>
                <p className="text-gray-700 leading-relaxed">{selectedAdviser.bio}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  handleVerify(selectedAdviser.id, selectedAdviser.is_verified);
                  setIsViewModalOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedAdviser.is_verified === 1
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedAdviser.is_verified === 1 ? 'Revoke Approval' : 'Approve & Verify Adviser'}
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdviserManagement;
