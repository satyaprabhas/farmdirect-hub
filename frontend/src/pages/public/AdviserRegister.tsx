import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, Loader2, Award } from 'lucide-react';
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

const SPECIALIZATIONS = [
  "Plant Pathology (Crop Diseases)",
  "Entomology (Pest Management)",
  "Agronomy & Crop Production",
  "Horticulture & Vegetable Crops",
  "Soil Science & Nutrient Management",
  "Organic Farming & Biopesticides"
];

export default function AdviserRegister() {
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
    specialization: SPECIALIZATIONS[0],
    qualification: 'M.Sc. (Agri) Plant Pathology',
    license_number: '',
    experience_years: '5',
    bio: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        email: formData.email,
        address: `${formData.address}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
        village: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        specialization: formData.specialization,
        qualification: formData.qualification,
        license_number: formData.license_number || 'AGR-' + Math.floor(100000 + Math.random() * 900000),
        experience_years: parseInt(formData.experience_years) || 5,
        bio: formData.bio || 'Certified Agricultural & Crop Health Consultant',
        role: 'ADVISER'
      });
      
      showToast(t('reg.regSuccess', 'Registration successful! Please login.'), 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('reg.regFailed', 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-purple-600">{t('reg.home', 'Home')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/register" className="hover:text-purple-600">{t('reg.register', 'Register')}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">{t('role.adviser', 'Agricultural Adviser')}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-8 py-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('adviser.dashTitle', 'Agricultural Adviser Registration')}</h1>
              <p className="text-purple-200 text-sm mt-1">
                {t('disease.subtitle', 'Provide professional diagnosis, treatments, and advice to farmers')}
              </p>
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
                {t('reg.personalInfo', 'Personal Information')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.fullName', 'Full Name (with title)')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Dr. A. V. Rao / Dr. K. Meena"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder={t('reg.mobilePlaceholder', '10-digit number')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.email', 'Email Address')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., adviser@agri.gov.in"
                  />
                </div>
              </div>
            </div>

            {/* Agronomic Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                {language === 'te' ? 'వృత్తిపరమైన నైపుణ్యాలు & అర్హతలు' : 'Professional Qualifications & Credentials'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adviser.specialization', 'Specialization Area')} *
                  </label>
                  <select
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'te' ? 'విద్యార్హత' : 'Highest Qualification'} *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., M.Sc. Agriculture / Ph.D."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('adviser.license', 'License / Registration ID')}
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., AGR-849201"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'te' ? 'అనుభవం (సంవత్సరాలు)' : 'Years of Experience'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="experience_years"
                    required
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'te' ? 'ప్రొఫైల్ వివరాలు / బయో' : 'Profile Bio / Research Background'}
                  </label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Brief description of your agricultural expertise, crops managed, and guidance approach..."
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {t('cart.address', 'Location Details')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reg.streetAddress', 'Office / Institution Address')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="">{t('reg.selectState', 'Select State')}</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('role.adviser', 'Register as Agricultural Adviser')
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('reg.haveAccount', 'Already have an account?')}{' '}
                <Link to="/" className="font-medium text-purple-600 hover:text-purple-500">
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
