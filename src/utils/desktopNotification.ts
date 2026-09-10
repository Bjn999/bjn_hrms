/**
 * Browser Desktop Notifications Utility using the Web Notifications API.
 */

export type DesktopNotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export interface DesktopNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  onClick?: () => void;
}

/**
 * Check if the browser supports notifications.
 */
export function isDesktopNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get the current desktop notification permission.
 */
export function getDesktopNotificationPermission(): DesktopNotificationPermission {
  if (!isDesktopNotificationSupported()) return 'unsupported';
  return Notification.permission as DesktopNotificationPermission;
}

/**
 * Request permission from the user for desktop notifications.
 */
export async function requestDesktopNotificationPermission(): Promise<DesktopNotificationPermission> {
  if (!isDesktopNotificationSupported()) return 'unsupported';

  try {
    const result = await Notification.requestPermission();
    return result as DesktopNotificationPermission;
  } catch (err) {
    console.warn('Error requesting desktop notification permission:', err);
    return Notification.permission as DesktopNotificationPermission;
  }
}

/**
 * Display a native desktop notification if permission is granted.
 */
export function showDesktopNotification(options: DesktopNotificationOptions): Notification | null {
  if (!isDesktopNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || `bjn-notify-${Date.now()}`,
      data: { url: options.url },
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();

      if (options.onClick) {
        options.onClick();
      } else if (options.url) {
        window.location.href = options.url;
      }

      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('Failed to display native desktop notification:', err);
    return null;
  }
}
