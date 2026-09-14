import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
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

export default function ConsumerRegister() {
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
    city: '',
    district: '',
    state: '',
    pincode: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
        address: `${formData.address}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
        role: 'CONSUMER'
      });
      
      showToast(t('reg.regSuccess', 'Registration successful! Please login.'), 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('reg.regFailed', 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">{t('reg.home', 'Home')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/register" className="hover:text-blue-600">{t('reg.register', 'Register')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="font-medium text-gray-900">{t('reg.consumerTitle', 'Consumer Registration')}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('reg.consumerTitle', 'Consumer Registration')}</h1>
                <p className="text-gray-500 mt-1">{t('reg.consumerSubtitle', 'Create your account to buy fresh produce directly from farmers')}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{t('reg.address', 'Address')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.streetAddress', 'Street Address')} *</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('reg.city', 'City / Location')} *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
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
