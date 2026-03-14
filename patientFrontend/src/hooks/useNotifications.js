// useNotifications.js - Custom hook for notification management
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useNotifications = (authUser) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [broadcastModal, setBroadcastModal] = useState({
    isOpen: false,
    message: '',
    type: 'broadcast'
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);

      // Find newest unread broadcast/alert
      const unreadBroadcasts = res.data.data.filter(
        n => !n.isRead && (n.type === 'broadcast' || n.type === 'alert')
      );

      if (unreadBroadcasts.length > 0) {
        const latest = unreadBroadcasts[0];
        setBroadcastModal({
          isOpen: true,
          message: latest.message,
          type: latest.type
        });
        // Mark as read
        await api.put(`/notifications/${latest._id}/read`);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      const initialTimeout = setTimeout(fetchNotifications, 2000);
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [authUser, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const closeBroadcast = () => {
    setBroadcastModal({ ...broadcastModal, isOpen: false });
  };

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    broadcastModal,
    closeBroadcast,
    markAllRead,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
};
