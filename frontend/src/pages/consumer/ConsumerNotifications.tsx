import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, Truck } from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ConsumerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      
      // Mark all as read after fetching
      const unread = res.data?.filter((n: Notification) => !n.is_read) || [];
      if (unread.length > 0) {
        await api.post('/notifications/mark-read');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'order_confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'order_shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      default:
        return <Info className="w-6 h-6 text-indigo-500" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case 'success':
      case 'order_confirmed': return 'bg-green-50 border-l-4 border-green-500';
      case 'warning': return 'bg-amber-50 border-l-4 border-amber-500';
      case 'order_shipped': return 'bg-blue-50 border-l-4 border-blue-500';
      default: return 'bg-indigo-50 border-l-4 border-indigo-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16">
          <EmptyState
            icon={Bell}
            title="No notifications"
            message="You're all caught up! We'll notify you when there are updates to your orders."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-4 transition-colors ${getBgColor(notification.type, notification.is_read)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {notification.title}
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {new Date(notification.created_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="mt-1 text-gray-600 font-medium">
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
