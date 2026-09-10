'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';
import { getEchoInstance, disconnectEcho, EchoConnectionState } from '@/utils/echo';
import { playNotificationSound, isSoundEnabled, setSoundEnabled, testNotificationSound } from '@/utils/sound';
import {
  getDesktopNotificationPermission,
  requestDesktopNotificationPermission,
  showDesktopNotification,
  DesktopNotificationPermission,
} from '@/utils/desktopNotification';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string | null;
  created_at_human: string;
  data?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  testSound: () => void;
  desktopPermission: DesktopNotificationPermission;
  requestDesktopPermission: () => Promise<DesktopNotificationPermission>;
  connectionStatus: EchoConnectionState;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: (silent?: boolean) => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [desktopPermission, setDesktopPermission] = useState<DesktopNotificationPermission>('default');
  const [connectionStatus, setConnectionStatus] = useState<EchoConnectionState>('idle');

  const subscribedUserIdRef = useRef<number | string | null>(null);

  // Initialize sound & desktop permissions from browser
  useEffect(() => {
    setSoundActive(isSoundEnabled());
    setDesktopPermission(getDesktopNotificationPermission());
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) {
      testNotificationSound();
    }
  }, [soundActive]);

  const testSound = useCallback(() => {
    testNotificationSound();
  }, []);

  const requestPermission = useCallback(async () => {
    const perm = await requestDesktopNotificationPermission();
    setDesktopPermission(perm);
    return perm;
  }, []);

  // Fetch initial notifications
  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Accept-Language': language,
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            setNotifications(json.data.notifications || []);
            setUnreadCount(json.data.unread_count || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [language]
  );

  const processedIdsRef = useRef<Set<string>>(new Set());

  // Helper to process incoming real-time notification
  const handleIncomingNotification = useCallback(
    (raw: any) => {
      const id = raw.id || raw.data?.id || `notif_${Date.now()}`;
      const title = raw.title || raw.data?.title || (language === 'ar' ? 'إشعار جديد' : 'New Notification');
      const message = raw.message || raw.data?.message || '';
      const actionUrl = raw.action_url || raw.data?.action_url || null;

      // Deduplicate: prevent duplicate processing of the same notification ID
      const dedupeKey = `${id}_${title}_${message}`;
      if (processedIdsRef.current.has(dedupeKey)) {
        return;
      }
      processedIdsRef.current.add(dedupeKey);
      setTimeout(() => {
        processedIdsRef.current.delete(dedupeKey);
      }, 10000);
      const type =
        (raw.data && raw.data.type) ||
        (typeof raw.type === 'string' && raw.type.includes('TestBroadcastNotification') ? 'system_test' : null) ||
        (typeof raw.type === 'string' && raw.type.includes('SubscriptionUpgradeRequestedNotification') ? 'subscription_upgrade_request' : null) ||
        (typeof raw.type === 'string' && raw.type.includes('SubscriptionUpgradeStatusNotification') ? 'subscription_upgrade_status' : null) ||
        raw.type ||
        'general';

      const newItem: NotificationItem = {
        id,
        type,
        title,
        message,
        action_url: actionUrl,
        is_read: false,
        read_at: null,
        created_at: raw.created_at || new Date().toISOString(),
        created_at_human: language === 'ar' ? 'الآن' : 'Just now',
        data: raw.data || raw,
      };

      // 1. Update State
      setNotifications((prev) => [newItem, ...prev.filter((item) => item.id !== id)]);
      setUnreadCount((prev) => prev + 1);

      // 2. Play Sound
      playNotificationSound();

      // 3. Desktop Notification
      showDesktopNotification({
        title: title,
        body: message,
        url: actionUrl || undefined,
        tag: `bjn-${id}`,
      });

      // 4. In-App Toast
      showToast(`${title}${message ? ': ' + message : ''}`, 'info');
    },
    [language, showToast]
  );

  const handleIncomingNotificationRef = useRef(handleIncomingNotification);
  useEffect(() => {
    handleIncomingNotificationRef.current = handleIncomingNotification;
  }, [handleIncomingNotification]);

  // Setup WebSocket (Echo + Reverb) Connection & Channel Subscription
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setConnectionStatus('idle');
      return;
    }

    let isMounted = true;

    // Fetch user details to get exact user ID for private channel
    const setupEcho = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!userRes.ok || !isMounted) return;
        const userData = await userRes.json();
        const user = userData.data?.user || userData.user || userData.data;
        const userId = user?.id;

        if (!userId || !isMounted) return;

        // Initialize Echo
        const echo = getEchoInstance();
        if (!echo) return;

        // Track real-time socket connection states
        if (echo.connector && (echo.connector as any).pusher) {
          const pusher = (echo.connector as any).pusher;
          setConnectionStatus(pusher.connection.state as EchoConnectionState);

          pusher.connection.bind('state_change', (states: { current: EchoConnectionState }) => {
            if (isMounted) {
              setConnectionStatus(states.current);
            }
          });
        }

        if (subscribedUserIdRef.current === userId) {
          return;
        }
        subscribedUserIdRef.current = userId;

        // Subscribe to user's private notification channel
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        // Remove any prior listener before binding a new one
        channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');

        // Listen for standard Laravel notification broadcasts
        channel.notification((notification: any) => {
          handleIncomingNotificationRef.current(notification);
        });
      } catch (err) {
        console.warn('Error connecting to notification websocket:', err);
      }
    };

    fetchNotifications();
    setupEcho();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  // Automatically re-fetch localized notifications when language changes
  useEffect(() => {
    fetchNotifications(true);
  }, [language, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/${id}/mark-as-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Accept-Language': language,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && typeof json.unread_count === 'number') {
          setUnreadCount(json.unread_count);
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Accept-Language': language,
        },
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Accept-Language': language,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && typeof json.unread_count === 'number') {
          setUnreadCount(json.unread_count);
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Send live test notification to current user
  const sendTestNotification = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/test-broadcast`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify({
          title: language === 'ar' ? 'إشعار تجريبي فوري 🔔' : 'Instant Test Notification 🔔',
          message:
            language === 'ar'
              ? 'تم اختبار الربط الحي عبر WebSockets والصوت والتنبيهات بنجاح تام! 🚀'
              : 'WebSockets, audio chime, and desktop alerts verified successfully! 🚀',
        }),
      });

      if (res.ok) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error triggering test notification:', err);
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        soundEnabled: soundActive,
        toggleSound,
        testSound,
        desktopPermission,
        requestDesktopPermission: requestPermission,
        connectionStatus,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
