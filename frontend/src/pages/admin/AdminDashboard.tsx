import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import DashboardCard from '../../components/common/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, ShoppingCart, Truck, Package, 
  ClipboardList, Clock, CheckCircle, IndianRupee, GraduationCap 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  totalFarmers: number;
  approvedFarmers?: number;
  pendingFarmers?: number;
  totalConsumers: number;
  totalAdvisers?: number;
  totalCoordinators: number;
  pendingCoordinators?: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  recentOrders: any[];
  topVegetables: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, translateVeg, language } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (error) {
      showToast(language === 'te' ? 'డ్యాష్‌బోర్డ్ డేటాను లోడ్ చేయడంలో విఫలమైంది' : 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashTitle', 'Admin Dashboard')}</h1>
        <p className="text-gray-500">{t('farmer.welcomeBack', 'Welcome back')}, {user?.full_name}</p>
      </div>

      {/* Alert Banner if Farmers are waiting for Admin Approval to sell */}
      {(data.pendingFarmers || 0) > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {language === 'te' 
                  ? `${data.pendingFarmers} రైతులు అమ్మకాల ఆమోదం కోసం వేచి ఉన్నారు` 
                  : `${data.pendingFarmers} Farmer(s) Awaiting Selling Approval`}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {language === 'te'
                  ? 'రైతులు ఉత్పత్తులను విక్రయించడానికి మీ ఆమోదం అవసరం. దయచేసి రైతు నిర్వహణలో పరిశీలించి ఆమోదించండి.'
                  : 'Farmers cannot list or sell produce until approved by Admin. Review pending applications and authorize selling.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/farmers')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            {language === 'te' ? 'రైతులను పరిశీలించండి →' : 'Review & Approve Farmers →'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <DashboardCard 
          title={t('admin.totalFarmers', 'Total Farmers')} 
          value={(data.totalFarmers || 0).toString()} 
          icon={<Users className="w-6 h-6 text-green-600" />} 
          className="bg-green-50"
        />
        <div 
          onClick={() => navigate('/admin/advisers')}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <DashboardCard 
            title={language === 'te' ? 'వ్యవసాయ సలహాదారులు' : 'Agri Advisers'} 
            value={((data as any).totalAdvisers || 0).toString()} 
            icon={<GraduationCap className="w-6 h-6 text-purple-600" />} 
            className="bg-purple-50"
          />
        </div>
        <DashboardCard 
          title={t('admin.totalConsumers', 'Total Consumers')} 
          value={(data.totalConsumers || 0).toString()} 
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />} 
          className="bg-blue-50"
        />
        <DashboardCard 
          title={t('admin.totalCoordinators', 'Total Coordinators')} 
          value={(data.totalCoordinators || 0).toString()} 
          icon={<Truck className="w-6 h-6 text-indigo-600" />} 
          className="bg-indigo-50"
        />
        <DashboardCard 
          title={t('admin.totalProducts', 'Total Products')} 
          value={(data.totalProducts || 0).toString()} 
          icon={<Package className="w-6 h-6 text-orange-600" />} 
          className="bg-orange-50"
        />
        <DashboardCard 
          title={t('admin.totalOrders', 'Total Orders')} 
          value={(data.totalOrders || 0).toString()} 
          icon={<ClipboardList className="w-6 h-6 text-cyan-600" />} 
          className="bg-cyan-50"
        />
        <DashboardCard 
          title={t('admin.pendingOrders', 'Pending Orders')} 
          value={(data.pendingOrders || 0).toString()} 
          icon={<Clock className="w-6 h-6 text-yellow-600" />} 
          className="bg-yellow-50"
        />
        <DashboardCard 
          title={t('admin.completedOrders', 'Completed Orders')} 
          value={(data.completedOrders || 0).toString()} 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          className="bg-green-50"
        />
        <DashboardCard 
          title={t('admin.totalSales', 'Total Sales')} 
          value={`₹${(data.totalSales || 0).toFixed(2)}`} 
          icon={<IndianRupee className="w-6 h-6 text-emerald-600" />} 
          className="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.recentOrders', 'Recent Orders')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">{t('coord.orderNum', 'Order #')}</th>
                  <th className="px-4 py-3">{t('coord.consumer', 'Consumer')}</th>
                  <th className="px-4 py-3">{t('coord.items', 'Product')}</th>
                  <th className="px-4 py-3">{t('cart.quantity', 'Qty')}</th>
                  <th className="px-4 py-3">{t('coord.amount', 'Total')}</th>
                  <th className="px-4 py-3">{t('coord.status', 'Status')}</th>
                  <th className="px-4 py-3">{t('coord.date', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.recentOrders || []).map((order: any) => (
                  <tr key={order.order_number} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3">{order.consumer_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {order.items?.map((item: any) => translateVeg(item.vegetable_name)).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      {order.items?.map((item: any) => `${item.quantity}${t('unit.' + item.unit, item.unit)}`).join(', ')}
                    </td>
                    <td className="px-4 py-3">₹{order.total_amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">{new Date(order.placed_at || order.created_at || '').toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.topVegetables', 'Top Selling Vegetables')}</h2>
          <div className="space-y-4">
            {(data.topVegetables || []).map((veg: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{translateVeg(veg.name)}</span>
                </div>
                <span className="text-gray-600">{veg.total_sold || 0} {language === 'te' ? 'అమ్మకాలు' : 'sold'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
