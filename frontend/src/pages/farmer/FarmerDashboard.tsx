import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Package, ClipboardList, CheckCircle, IndianRupee, Plus, AlertTriangle, FlaskConical } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PriceDisplay from '../../components/common/PriceDisplay';

interface DashboardData {
  produceCount: number;
  stockSum: number;
  ordersReceived: number;
  completedOrders: number;
  totalEarnings: number;
  recentOrders: any[];
}

const FarmerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, translateVeg, language } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isVerified = user?.is_verified === 1;

  useEffect(() => {
    refreshUser?.();
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/farmer/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error('Error fetching farmer dashboard:', err);
        setError(language === 'te' ? 'డ్యాష్‌బోర్డ్ డేటాను లోడ్ చేయడంలో విఫలమైంది.' : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAddProduceClick = () => {
    if (!isVerified) {
      showToast(
        language === 'te'
          ? 'మీ రైతు ఖాతా అడ్మిన్ ద్వారా ఆమోదించబడలేదు. అడ్మిన్ ఆమోదించిన తర్వాత మాత్రమే ఉత్పత్తులను విక్రయించగలరు.'
          : 'Your farmer account is pending approval by the Admin. You cannot sell or list produce until approved.',
        'error'
      );
      return;
    }
    navigate('/farmer/add-produce');
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('farmer.dashTitle', 'Farmer Dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('farmer.welcomeBack', 'Welcome back')}, {user?.full_name}!
          </p>
        </div>
        <button
          onClick={handleAddProduceClick}
          className={`${
            isVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          } px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm`}
          title={!isVerified ? 'Account pending Admin approval' : undefined}
        >
          <Plus size={20} />
          {t('farmer.addNewProduce', 'Add New Produce')}
        </button>
      </div>

      {/* Admin Approval Notice Banner for Unverified Farmers */}
      {!isVerified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-900">
                {language === 'te' ? 'అడ్మిన్ ఆమోదం కోసం వేచి ఉంది (ధృవీకరించబడలేదు)' : 'Account Pending Admin Approval (Unverified)'}
              </h3>
              <span className="bg-amber-200/80 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {language === 'te' ? 'అమ్మకాలు నిలిపివేయబడ్డాయి' : 'Selling Restricted'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">
              {language === 'te'
                ? 'మీ రైతు ఖాతా ఇంకా అడ్మిన్ ద్వారా ఆమోదించబడలేదు. అడ్మిన్ పోర్టల్‌లో ఆమోదం పొందిన తర్వాత మాత్రమే మీరు ఉత్పత్తులను విక్రయించడానికి నమోదు చేయగలరు.'
                : 'Your farmer account has not been approved by the Admin yet. You will be permitted to list and sell fresh produce once the Admin verifies your account in the Admin Portal.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard 
          title={t('farmer.totalProduce', 'Total Produce')} 
          value={data.produceCount.toString()} 
          icon={<Sprout size={24} className="text-green-500" />} 
        />
        <DashboardCard 
          title={t('farmer.availableStock', 'Available Stock')} 
          value={`${data.stockSum} ${t('unit.kg', 'kg')}`} 
          icon={<Package size={24} className="text-blue-500" />} 
        />
        <DashboardCard 
          title={t('farmer.ordersReceived', 'Orders Received')} 
          value={data.ordersReceived.toString()} 
          icon={<ClipboardList size={24} className="text-purple-500" />} 
        />
        <DashboardCard 
          title={t('farmer.completedOrders', 'Completed Orders')} 
          value={data.completedOrders.toString()} 
          icon={<CheckCircle size={24} className="text-teal-500" />} 
        />
        <DashboardCard 
          title={t('farmer.totalEarnings', 'Total Earnings')} 
          value={`₹${data.totalEarnings || 0}`} 
          icon={<IndianRupee size={24} className="text-yellow-500" />} 
        />
      </div>

      {/* Advisory, Disease Detection & Farmer Support Feature Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate('/farmer/crop-advisory')}
          className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 bg-white/20 px-2 py-0.5 rounded">
              {language === 'te' ? 'లాభదాయక సాగు' : 'Profit Optimization'}
            </span>
            <h3 className="text-lg font-bold group-hover:underline">
              {t('advisory.title', 'Crop Advisory')}
            </h3>
            <p className="text-xs text-emerald-100 max-w-sm line-clamp-2">
              {t('advisory.subtitle', 'See which crops yield highest profits based on market trends.')}
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform shrink-0">
            <Sprout className="w-6 h-6 text-white" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/farmer/disease-detection')}
          className="bg-gradient-to-r from-rose-500 to-amber-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-100 bg-white/20 px-2 py-0.5 rounded">
              {language === 'te' ? 'తెగుళ్ల నివారణ' : 'Disease Detection'}
            </span>
            <h3 className="text-lg font-bold group-hover:underline">
              {t('disease.title', 'Crop Disease Detection')}
            </h3>
            <p className="text-xs text-rose-100 max-w-sm line-clamp-2">
              {t('disease.subtitle', 'Upload photo of diseased crop and receive prescription.')}
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform shrink-0">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/farmer/support')}
          className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-100 bg-white/20 px-2 py-0.5 rounded">
              {language === 'te' ? 'నేల & ఎరువుల ప్రణాళిక' : 'Soil & Nutrients'}
            </span>
            <h3 className="text-lg font-bold group-hover:underline">
              {t('menu.farmerSupport', 'Farmer Support')}
            </h3>
            <p className="text-xs text-teal-100 max-w-sm line-clamp-2">
              {t('support.subtitle', 'Upload soil report to get custom N-P-K nutrient dosage and save fertilizer cost.')}
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform shrink-0">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {t('farmer.recentOrders', 'Recent Orders')}
          </h2>
          <Link to="/farmer/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
            {t('common.viewAll', 'View All')}
          </Link>
        </div>
        
        {data.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-medium">{t('coord.orderNum', 'Order #')}</th>
                  <th className="p-4 font-medium">{t('farmer.produce', 'Produce')}</th>
                  <th className="p-4 font-medium">{t('cart.quantity', 'Quantity')}</th>
                  <th className="p-4 font-medium">{t('coord.amount', 'Amount')}</th>
                  <th className="p-4 font-medium">{t('coord.status', 'Status')}</th>
                  <th className="p-4 font-medium">{t('farmer.date', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.recentOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{translateVeg(order.vegetable_name)}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{order.quantity} {t(`unit.${order.unit}`, order.unit)}</td>
                    <td className="p-4 text-sm font-medium">₹{order.subtotal}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-sm text-gray-500">{new Date(order.placed_at).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState 
              icon={ClipboardList}
              title={t('farmer.noRecentOrders', 'No recent orders')}
              message={t('farmer.noRecentOrdersDesc', 'When customers buy your produce, orders will appear here.')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
