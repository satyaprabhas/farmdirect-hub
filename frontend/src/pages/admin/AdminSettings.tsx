import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Lock, Settings } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.full_name || '',
    email: 'admin@farmdirect.com', // placeholder if not in user object
    mobile: user?.mobile_number || ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    showToast('Profile updated successfully', 'success');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={profileData.mobile}
                  onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 font-medium transition-colors">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <Lock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Security</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4 text-sm">Update your password to keep your account secure.</p>
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50 font-medium transition-colors">
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">Manage global application settings, maintenance mode, and backups.</p>
          <div className="space-y-3 max-w-sm">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600 rounded" />
              <span className="text-gray-700 font-medium">Enable Email Notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600 rounded" />
              <span className="text-gray-700 font-medium">Maintenance Mode</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
