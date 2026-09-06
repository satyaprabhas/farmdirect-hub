import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Bell } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const CoordNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <Bell className="w-6 h-6 mr-2" /> Notifications
      </h1>
      
      <div className="space-y-3">
        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">No new notifications.</p>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-4 rounded-lg border ${notif.isRead ? 'bg-white text-gray-600' : 'bg-primary-50 border-primary-200 text-gray-800'}`}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{notif.title}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1">{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoordNotifications;
