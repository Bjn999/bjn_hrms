'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications, NotificationItem } from '@/contexts/NotificationContext';

interface NotificationDropdownProps {
  theme?: 'dark' | 'light';
  className?: string;
}

export default function NotificationDropdown({ theme = 'light', className = '' }: NotificationDropdownProps) {
  const router = useRouter();
  const { language, t } = useLanguage();

  const {
    notifications,
    unreadCount,
    loading,
    soundEnabled,
    toggleSound,
    desktopPermission,
    requestDesktopPermission,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    sendTestNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [isTesting, setIsTesting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      await markAsRead(id);
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Mark all notifications as read
  const handleMarkAll = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  // Click on notification item
  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.action_url) {
      router.push(item.action_url);
    }
  };

  // Trigger test live broadcast
  const handleTestBroadcast = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTesting) return;
    setIsTesting(true);
    try {
      await sendTestNotification();
    } finally {
      setTimeout(() => setIsTesting(false), 800);
    }
  };

  // Connection badge helper
  const renderConnectionBadge = () => {
    if (connectionStatus === 'connected') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
            isDark
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
          title={t('live_connected')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="truncate">{t('live_connected')}</span>
        </span>
      );
    }

    if (connectionStatus === 'connecting') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
            isDark
              ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
          title={t('live_connecting')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span className="truncate">{t('live_connecting')}</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
          isDark
            ? 'bg-slate-800 text-slate-400 border border-slate-700'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}
        title={t('live_disconnected')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span className="truncate">{t('live_disconnected')}</span>
      </span>
    );
  };

  // Notification Icon Helper
  const renderNotificationIcon = (type: string) => {
    if (type === 'subscription_upgrade_request') {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }

    if (type === 'system_test') {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isDark
            ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 shadow-sm'
            : 'bg-slate-50 hover:bg-indigo-50/80 text-slate-600 hover:text-indigo-600 border border-slate-200 shadow-sm'
        }`}
        title={t('notifications')}
        aria-label={t('notifications')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge with Ping animation */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 flex h-5 min-w-5 items-center justify-center px-1 text-[11px] font-bold text-white bg-rose-500 rounded-full shadow-md animate-in zoom-in-50 duration-200">
            <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-60"></span>
            <span className="relative">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            language === 'ar' ? 'left-0 sm:left-auto sm:right-auto rtl:right-auto rtl:left-0' : 'right-0'
          } mt-2 w-84 sm:w-96 rounded-2xl shadow-2xl border transition-all duration-200 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 ${
            isDark
              ? 'bg-slate-800/95 border-slate-700/80 text-white backdrop-blur-xl divide-slate-700/60'
              : 'bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-xl divide-slate-100'
          }`}
        >
          {/* Header Top Row */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              isDark ? 'border-slate-700/80 bg-slate-900/50' : 'border-slate-100 bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">{t('notifications')}</h3>
              {unreadCount > 0 && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}
                >
                  {unreadCount} {t('unread_notifications_count')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg ${
                    isDark
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-700/60'
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  } disabled:opacity-50`}
                  title={t('mark_all_as_read')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{markingAll ? t('saving') : t('mark_all_as_read')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Settings & Real-Time Bar */}
          <div
            className={`px-3.5 py-2 flex items-center justify-between gap-2 border-b text-xs ${
              isDark ? 'border-slate-700/60 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            {/* Live Socket Status */}
            <div>{renderConnectionBadge()}</div>

            {/* Quick Action Buttons: Sound, Desktop Alert, Test */}
            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-medium ${
                  soundEnabled
                    ? isDark
                      ? 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : isDark
                    ? 'bg-slate-700/60 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-200/60 text-slate-500 hover:text-slate-800'
                }`}
                title={soundEnabled ? t('sound_enabled') : t('sound_muted')}
              >
                {soundEnabled ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"
                    />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                )}
              </button>

              {/* Desktop Notification Request */}
              {desktopPermission !== 'granted' && desktopPermission !== 'unsupported' && (
                <button
                  type="button"
                  onClick={requestDesktopPermission}
                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold ${
                    isDark
                      ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border border-blue-700/50'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title={t('enable_desktop_notifications')}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span>{t('desktop_notifications')}</span>
                </button>
              )}

              {/* Test Live Broadcast Button */}
              <button
                type="button"
                onClick={handleTestBroadcast}
                disabled={isTesting}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold ${
                  isDark
                    ? 'bg-slate-800 hover:bg-indigo-900/60 text-indigo-300 border border-slate-700'
                    : 'bg-slate-100 hover:bg-indigo-50 text-indigo-600 border border-slate-200'
                } disabled:opacity-50`}
                title={t('send_test_notification')}
              >
                {isTesting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/40 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-slate-400 flex flex-col items-center gap-2">
                <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{t('loading')}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('no_notifications')}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isMarking = markingIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative p-3.5 flex items-start gap-3 transition-all duration-150 cursor-pointer ${
                      !item.is_read
                        ? isDark
                          ? 'bg-blue-950/30 hover:bg-blue-900/40 border-r-4 rtl:border-r-0 rtl:border-l-4 border-blue-500'
                          : 'bg-blue-50/50 hover:bg-blue-100/50 border-r-4 rtl:border-r-0 rtl:border-l-4 border-blue-500'
                        : isDark
                        ? 'hover:bg-slate-700/40 opacity-75 hover:opacity-100'
                        : 'hover:bg-slate-50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Type Icon */}
                    {renderNotificationIcon(item.type)}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !item.is_read
                              ? isDark
                                ? 'text-white'
                                : 'text-slate-900'
                              : isDark
                              ? 'text-slate-300'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.title}
                        </h4>

                        {!item.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse"></span>
                        )}
                      </div>

                      <p
                        className={`text-xs line-clamp-2 leading-relaxed mb-1.5 ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                          {item.created_at_human}
                        </span>

                        {/* Separate Mark as Read Button (Does NOT redirect) */}
                        {!item.is_read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            disabled={isMarking}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                              isDark
                                ? 'bg-slate-700/80 hover:bg-blue-600 text-slate-300 hover:text-white'
                                : 'bg-slate-200/70 hover:bg-blue-600 text-slate-700 hover:text-white'
                            } disabled:opacity-50`}
                            title={t('mark_as_read')}
                          >
                            {isMarking ? (
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <span>{t('mark_as_read')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
