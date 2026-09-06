import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingCart, Truck } from 'lucide-react';

export default function RegisterSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      icon: <Sprout className="w-12 h-12 mb-4 text-primary-600" />,
      description: 'List your produce and sell directly to consumers at fair prices.',
      buttonText: 'Register as Farmer',
      path: '/register/farmer',
      hoverColor: 'hover:border-primary-500 hover:shadow-primary-100',
      btnColor: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      id: 'consumer',
      title: 'Consumer',
      icon: <ShoppingCart className="w-12 h-12 mb-4 text-blue-600" />,
      description: 'Buy fresh, quality produce directly from verified local farmers.',
      buttonText: 'Register as Consumer',
      path: '/register/consumer',
      hoverColor: 'hover:border-blue-500 hover:shadow-blue-100',
      btnColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'coordinator',
      title: 'Coordinator',
      icon: <Truck className="w-12 h-12 mb-4 text-orange-600" />,
      description: 'Help coordinate deliveries between farmers and consumers efficiently.',
      buttonText: 'Register as Coordinator',
      path: '/register/coordinator',
      hoverColor: 'hover:border-orange-500 hover:shadow-orange-100',
      btnColor: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center animate-fade-in">
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 mb-6 hover:opacity-80 transition-opacity">
            <Sprout className="w-8 h-8" />
            <span className="text-2xl font-bold">FarmDirect Hub</span>
          </Link>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Join FarmDirect Hub</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started and be part of the agricultural revolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-primary-600 hover:text-primary-500">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
