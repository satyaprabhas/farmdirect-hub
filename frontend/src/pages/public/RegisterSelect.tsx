import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingCart, Truck, GraduationCap, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';

export default function RegisterSelect() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const roles = [
    {
      id: 'farmer',
      title: t('role.farmer', 'Farmer'),
      icon: <Sprout className="w-12 h-12 mb-4 text-primary-600" />,
      description: t('reg.farmerDesc', 'List your produce and sell directly to consumers at fair prices.'),
      buttonText: t('reg.asFarmer', 'Register as Farmer'),
      path: '/register/farmer',
      hoverColor: 'hover:border-primary-500 hover:shadow-primary-100',
      btnColor: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      id: 'consumer',
      title: t('role.consumer', 'Consumer'),
      icon: <ShoppingCart className="w-12 h-12 mb-4 text-blue-600" />,
      description: t('reg.consumerDesc', 'Buy fresh, quality produce directly from verified local farmers.'),
      buttonText: t('reg.asConsumer', 'Register as Consumer'),
      path: '/register/consumer',
      hoverColor: 'hover:border-blue-500 hover:shadow-blue-100',
      btnColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'large-scale',
      title: t('role.largeScaleConsumer', 'Large Scale Consumer'),
      icon: <Building2 className="w-12 h-12 mb-4 text-emerald-600" />,
      description: t('bulk.registerSubtitle', 'Buy wholesale bulk produce directly from farmers at mandated rates.'),
      buttonText: t('role.largeScaleConsumer', 'Register as Bulk Buyer'),
      path: '/register/large-scale',
      hoverColor: 'hover:border-emerald-500 hover:shadow-emerald-100',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'adviser',
      title: t('role.adviser', 'Agricultural Adviser'),
      icon: <GraduationCap className="w-12 h-12 mb-4 text-purple-600" />,
      description: t('disease.subtitle', 'Provide professional plant pathology and crop health prescriptions to farmers.'),
      buttonText: t('role.adviser', 'Register as Adviser'),
      path: '/register/adviser',
      hoverColor: 'hover:border-purple-500 hover:shadow-purple-100',
      btnColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'coordinator',
      title: t('role.coordinator', 'Coordinator'),
      icon: <Truck className="w-12 h-12 mb-4 text-orange-600" />,
      description: t('reg.coordinatorDesc', 'Help coordinate deliveries between farmers and consumers efficiently.'),
      buttonText: t('reg.asCoordinator', 'Register as Coordinator'),
      path: '/register/coordinator',
      hoverColor: 'hover:border-orange-500 hover:shadow-orange-100',
      btnColor: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center animate-fade-in relative">
      {/* Top Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="max-w-5xl mx-auto w-full">
        
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 mb-6 hover:opacity-80 transition-opacity">
            <Sprout className="w-8 h-8" />
            <span className="text-2xl font-bold">{t('brand.name', 'FarmDirect Hub')}</span>
          </Link>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('reg.joinTitle', 'Join FarmDirect Hub')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('reg.joinSubtitle', 'Choose your role to get started and be part of the agricultural revolution.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <div 
              key={role.id}
              onClick={() => navigate(role.path)}
              className={`bg-white rounded-2xl p-8 shadow-sm border-2 border-transparent ${role.hoverColor} transition-all duration-300 cursor-pointer flex flex-col items-center text-center group`}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
              <p className="text-gray-600 mb-8 flex-grow">{role.description}</p>
              
              <button
                className={`w-full py-3 px-6 rounded-xl text-white font-medium shadow-sm transition-colors ${role.btnColor}`}
              >
                {role.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            {t('reg.haveAccount', 'Already have an account?')}{' '}
            <Link to="/" className="font-semibold text-primary-600 hover:text-primary-500">
              {t('reg.loginHere', 'Login here')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
