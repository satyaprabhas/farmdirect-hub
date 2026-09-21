import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Loader2, Info } from 'lucide-react';
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

export default function LargeScaleRegister() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

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
    pincode: '',
    businessName: ''
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
        fullName: formData.businessName ? `${formData.fullName} (${formData.businessName})` : formData.fullName,
        username: formData.username,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: `${formData.address}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
        village: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        role: 'LARGE_SCALE_CONSUMER'
      });
      
      showToast(t('reg.regSuccess', 'Registration successful! Please login.'), 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('reg.regFailed', 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-emerald-600">{t('reg.home', 'Home')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/register" className="hover:text-emerald-600">{t('reg.register', 'Register')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">{t('role.largeScaleConsumer', 'Large Scale Consumer')}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('bulk.dashTitle', 'Large Scale Consumer Wholesale Registration')}</h1>
              <p className="text-emerald-100 text-sm mt-1">
                {t('bulk.registerSubtitle', 'Buy wholesale bulk produce directly from farmers at mandated rates.')}
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-start gap-3 text-emerald-800 text-sm">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('bulk.minNotice', 'Minimum order ₹500. Bulk orders must be collected directly from the FarmDirect Hub.')}</p>
              <p className="text-xs text-emerald-700 mt-0.5">{t('bulk.noLimitNotice', 'No quantity limits! Order in bulk directly from verified farmers.')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t('reg.personalInfo', 'Personal & Business Information')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.fullName', 'Full Name / Contact Person')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Rajesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bulk.businessName', 'Business / Organization Name')}
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Green Valley Caterers / Hotel Grand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.username', 'Username')} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.mobileNumber', 'Mobile Number')} *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder={t('reg.mobilePlaceholder', '10-digit number')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.email', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {language === 'te' ? 'భద్రత' : 'Security'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.password', 'Password')} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.confirmPassword', 'Confirm Password')} *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t('cart.shippingAddress', 'Delivery / Warehouse Address')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.streetAddress', 'Street Address / Building')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reg.city', 'City / Village')} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reg.district', 'District')} *
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reg.state', 'State')} *
                    </label>
                    <select
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="">{t('reg.selectState', 'Select State')}</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reg.pincode', 'Pincode')} *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder={t('reg.pincodePlaceholder', '6-digit PIN')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('reg.createAccount', 'Register as Large Scale Consumer')
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('reg.haveAccount', 'Already have an account?')}{' '}
                <Link to="/" className="font-medium text-emerald-600 hover:text-emerald-500">
                  {t('reg.loginHere', 'Login here')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
