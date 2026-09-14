import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function FarmerRegister() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    farmName: '',
    farmType: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto suggest username based on full name if username is empty or matches auto-gen
    if (name === 'fullName' && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: value.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('reg.passwordsMismatch', "Passwords don't match"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('reg.passwordLength', "Password must be at least 6 characters"));
      return;
    }
    
    if (formData.mobileNumber.length !== 10) {
      setError(t('reg.validMobile', "Please enter a valid 10-digit mobile number"));
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        address: `${formData.address}, ${formData.village}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
        role: 'FARMER'
      });
      
      showToast(t('reg.regSuccess', 'Registration successful! Please login.'), 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('reg.regFailed', 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-600">{t('reg.home', 'Home')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/register" className="hover:text-primary-600">{t('reg.register', 'Register')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="font-medium text-gray-900">{t('reg.farmerTitle', 'Farmer Registration')}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <Sprout className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('reg.farmerTitle', 'Farmer Registration')}</h1>
                <p className="text-gray-500 mt-1">{t('reg.farmerSubtitle', 'Create your farmer account to start selling directly to consumers')}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{t('reg.personalInfo', 'Personal Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.fullName', 'Full Name')} *</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.username', 'Username')} *</label>
                    <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.mobileNumber', 'Mobile Number')} *</label>
                    <input required type="tel" name="mobileNumber" pattern="[0-9]{10}" maxLength={10} value={formData.mobileNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder={t('reg.mobilePlaceholder', '10-digit number')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.email', 'Email Address')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.password', 'Password')} *</label>
                    <input required type="password" name="password" minLength={6} value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.confirmPassword', 'Confirm Password')} *</label>
                    <input required type="password" name="confirmPassword" minLength={6} value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{t('reg.address', 'Address')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.streetAddress', 'Street Address')} *</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.village', 'Village / Location')} *</label>
                    <input required type="text" name="village" value={formData.village} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.district', 'District')} *</label>
                    <input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.state', 'State')} *</label>
                    <select required name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="">{t('reg.selectState', 'Select State')}</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.pincode', 'Pincode')} *</label>
                    <input required type="text" name="pincode" pattern="[0-9]{6}" maxLength={6} value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder={t('reg.pincodePlaceholder', '6-digit PIN')} />
                  </div>
                </div>
              </div>

              {/* Section 3: Farm Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{t('reg.farmDetails', 'Farm Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.farmName', 'Farm Name')}</label>
                    <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder={t('reg.farmNamePlaceholder', 'e.g., Sri Sai Farms')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.farmType', 'Farm Type')}</label>
                    <select name="farmType" value={formData.farmType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="">{t('reg.selectFarmType', 'Select Farm Type')}</option>
                      <option value="Mixed Farming">{t('reg.farmTypeMixed', 'Mixed Farming')}</option>
                      <option value="Organic">{t('reg.farmTypeOrganic', 'Organic')}</option>
                      <option value="Traditional">{t('reg.farmTypeTraditional', 'Traditional')}</option>
                      <option value="Horticulture">{t('reg.farmTypeHorticulture', 'Horticulture')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{t('reg.bankDetails', 'Bank Account Details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.bankName', 'Bank Name')}</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.accountNumber', 'Account Number')}</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.ifscCode', 'IFSC Code')}</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.accountHolderName', 'Account Holder Name')}</label>
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('reg.createAccount', 'Create Account')}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">
                  {t('reg.haveAccount', 'Already have an account?')}{' '}
                  <Link to="/" className="font-semibold text-primary-600 hover:text-primary-500">
                    {t('reg.loginHere', 'Login here')}
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
