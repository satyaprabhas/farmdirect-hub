import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'pill';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', variant = 'navbar' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 transition-all ${className}`}
        title="Switch Language / భాషను మార్చండి"
      >
        <Languages className="w-3.5 h-3.5 text-primary-600" />
        <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 rounded-xl border border-gray-200 bg-gray-50/80 shadow-sm ${className}`}>
      <div className="flex items-center pl-2 pr-1 text-gray-500">
        <Languages className="w-4 h-4 text-primary-600" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'en'
            ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('te')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'te'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
};

export default LanguageToggle;
