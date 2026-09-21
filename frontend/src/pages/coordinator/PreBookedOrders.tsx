import React, { useState, useEffect } from 'react';
import { Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_OPTIONS = [
  'PLACED',
  'CONFIRMED',
  'PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

const PreBookedOrders: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { showToast } = useToast();
  const { t, translateVeg, language } = useLanguage();

  const isVerified = user?.is_verified === 1;

  const fetchOrders = async (statusFilter = 'All') => {
    setLoading(true);
    try {
      const endpoint = statusFilter === 'All' 
        ? '/coordinator/orders' 
        : `/coordinator/orders?status=${statusFilter}`;
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser?.();
    fetchOrders(filter);
  }, [filter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!isVerified) {
      showToast(
        language === 'te' 
          ? 'మీ ఖాతా అడ్మిన్ ఆమోదం కోసం వేచి ఉంది. ఆర్డర్ స్థితిని మార్చడానికి అనుమతి లేదు.'
          : 'Your coordinator account is pending approval by Admin. You cannot update order status.',
        'error'
      );
      return;
    }

    if (!window.confirm(language === 'te' ? `ఆర్డర్ స్థితిని ${t('status.' + newStatus, newStatus)}కి మార్చాలా?` : `Change order status to ${newStatus}?`)) return;
    
    try {
      await api.put(`/coordinator/orders/${orderId}/status`, { status: newStatus });
      showToast(language === 'te' ? 'ఆర్డర్ స్థితి విజయవంతంగా నవీకరించబడింది' : 'Order status updated successfully', 'success');
      fetchOrders(filter);
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errMsg = error.response?.data?.error || 'Failed to update status';
      showToast(errMsg, 'error');
    }
  };

  const tabs = ['All', 'PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getTabLabel = (tab: string) => {
    if (tab === 'All') return t('coord.allOrders', 'All Orders');
    if (tab === 'PLACED') return t('coord.new', 'New');
    if (tab === 'OUT_FOR_DELIVERY') return t('coord.inTransit', 'In Transit');
    if (tab === 'DELIVERED') return t('coord.delivered', 'Delivered');
    return t(`status.${tab}`, tab.charAt(0) + tab.slice(1).toLowerCase());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('coord.preBooked', 'Pre-Booked Orders')}
      </h1>

      {/* Admin Approval Notice Banner for Unverified Coordinators */}
      {!isVerified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {language === 'te' ? 'అడ్మిన్ ఆమోదం కోసం వేచి ఉంది (ధృవీకరించబడలేదు)' : 'Account Pending Admin Approval (Unverified)'}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">
              {language === 'te'
                ? 'మీ సమన్వయకర్త ఖాతా ఇంకా అడ్మిన్ ద్వారా ఆమోదించబడలేదు. అడ్మిన్ ఆమోదించే వరకు ఆర్డర్ స్థితిని నవీకరించడం నిలిపివేయబడింది.'
                : 'Your coordinator account is pending approval by the Admin. You cannot update order statuses or manage dispatches until approved in the Admin Portal.'}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              filter === tab ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setFilter(tab)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">{t('coord.orderNum', 'Order #')}</th>
                  <th className="p-4 font-medium">{t('coord.items', 'Items')}</th>
                  <th className="p-4 font-medium">{t('coord.consumer', 'Consumer')}</th>
                  <th className="p-4 font-medium">{t('coord.amount', 'Amount')}</th>
                  <th className="p-4 font-medium">{t('coord.status', 'Status')}</th>
                  <th className="p-4 font-medium">{t('coord.date', 'Date')}</th>
                  <th className="p-4 font-medium">{t('coord.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4">
                      <span className="font-semibold text-gray-900 block">{order.order_number}</span>
                      {order.order_type === 'BULK' ? (
                        <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-200">
                          🏢 {t('bulk.badge', 'Bulk Buyer')}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          Retail
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.items?.map((item: any) => `${translateVeg(item.vegetable_name)} (${item.quantity}${t('unit.' + item.unit, item.unit)}) - ${language === 'te' ? 'రైతు' : 'from'}: ${item.farmer_name || 'రైతు'}`).join(', ')}
                    </td>
                    <td className="p-4 text-gray-600">{order.consumer_name}</td>
                    <td className="p-4 font-medium text-gray-900">
                      <div>₹{order.total_amount}</div>
                      {order.advance_amount > 0 && (
                        <div className="text-[11px] text-amber-700 font-normal mt-0.5">
                          Adv: ₹{order.advance_amount} • Rem: ₹{order.remaining_amount}
                        </div>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-gray-500">{new Date(order.placed_at).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US')}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Link to={`/coordinator/orders/${order.id}`} className="text-gray-400 hover:text-green-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <select 
                          value={order.status}
                          disabled={!isVerified}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs border rounded-lg px-2 py-1.5 focus:ring-green-500 focus:border-green-500 ${
                            isVerified 
                              ? 'border-gray-200 bg-white cursor-pointer' 
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={!isVerified ? (language === 'te' ? 'అడ్మిన్ ఆమోదం అవసరం' : 'Admin approval required') : undefined}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{t(`status.${status}`, status.replace(/_/g, ' '))}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500">
                      <p className="font-medium text-lg mb-1">{t('coord.noOrders', 'No orders found')}</p>
                      <p className="text-sm">{t('coord.noOrdersDesc', 'Orders matching this filter will appear here.')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreBookedOrders;
