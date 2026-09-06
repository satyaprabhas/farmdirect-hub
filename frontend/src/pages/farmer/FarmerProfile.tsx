import React, { useState, useEffect } from 'react';
import { User, MapPin, Building2, CreditCard, ShieldCheck, Save, Camera } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FarmerProfile: React.FC = () => {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    farm_name: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        const userData = response.data.data || response.data;
        setFormData({
          name: userData.name || '',
          mobile: userData.mobile || '',
          email: userData.email || '',
          farm_name: userData.farm_name || '',
          village: userData.village || '',
          district: userData.district || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          bank_name: userData.bank_name || '',
          account_number: userData.account_number || '',
          ifsc_code: userData.ifsc_code || '',
          account_holder: userData.account_holder || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/profile', formData);
      showToast('success', 'Profile updated successfully!');
      
      // Refresh profile data
      if (response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your personal and farm information</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
          <ShieldCheck size={20} />
          <span className="font-medium">Verified Farmer</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
            <User className="text-gray-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-6 mb-2">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-md relative">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'F'}
                <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-colors">
                  <Camera size={14} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name || 'Your Name'}</h3>
                <p className="text-gray-500 dark:text-gray-400">Farmer ID: FRM-{user?.id?.toString().substring(0, 6) || '123456'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address (Optional)</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Farm & Location Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
            <Building2 className="text-gray-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Farm & Location Details</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Name</label>
              <input 
                type="text" 
                name="farm_name"
                value={formData.farm_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village/City</label>
              <input 
                type="text" 
                name="village"
                value={formData.village}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
              <input 
                type="text" 
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
              <input 
                type="text" 
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
            <CreditCard className="text-gray-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Bank Details for Payments</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm mb-2 flex items-start gap-3">
                <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                <p>Your bank details are kept secure and are only used for direct deposits of your earnings.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
              <input 
                type="text" 
                name="account_holder"
                value={formData.account_holder}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
              <input 
                type="text" 
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <input 
                type="password" 
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
              <input 
                type="text" 
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-70"
          >
            {saving ? (
              <><LoadingSpinner size="sm" color="white" /> Saving...</>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmerProfile;
