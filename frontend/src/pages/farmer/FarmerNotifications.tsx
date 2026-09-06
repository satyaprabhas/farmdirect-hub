import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const FarmerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Bell className="text-green-600" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Updates about your orders and listings</p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState 
              icon={Bell}
              title="You're all caught up!"
              message="You have no new notifications right now."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 sm:p-6 transition-colors flex gap-4 ${
                  notification.is_read 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-green-50/50 dark:bg-green-900/10'
                }`}
              >
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notification.is_read ? 'bg-transparent' : 'bg-green-500'}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-base font-semibold ${notification.is_read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${notification.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="mt-3 flex gap-3">
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerNotifications;
