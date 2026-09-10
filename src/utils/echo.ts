import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any> | undefined;
  }
}

let echoInstance: Echo<any> | null = null;
let currentToken: string | null = null;

export type EchoConnectionState = 'connecting' | 'connected' | 'unavailable' | 'failed' | 'disconnected' | 'idle';

/**
 * Get or initialize singleton Echo instance configured for Laravel Reverb.
 */
export function getEchoInstance(): Echo<any> | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('auth_token');
  if (!token) {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
    }
    return null;
  }

  // If token changed or no instance, reinitialize
  if (!echoInstance || currentToken !== token) {
    if (echoInstance) {
      try {
        echoInstance.disconnect();
      } catch (e) {
        console.warn('Error disconnecting prior Echo instance:', e);
      }
    }

    currentToken = token;
    window.Pusher = Pusher;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
    const host = process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1';
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080;
    const isHttps =
      process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https' ||
      (typeof window !== 'undefined' && window.location.protocol === 'https:');
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'bjn_hrms_app_key';

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: key,
      wsHost: host,
      wsPort: isHttps ? undefined : port,
      wssPort: isHttps ? port : undefined,
      forceTLS: isHttps,
      encrypted: isHttps,
      disableStats: true,
      enabledTransports: isHttps ? ['wss'] : ['ws'],
      authEndpoint: `${baseUrl}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    window.Echo = echoInstance;
  }

  return echoInstance;
}

/**
 * Disconnect Echo and clean up instance (e.g. on logout).
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      console.warn('Error disconnecting Echo:', e);
    }
    echoInstance = null;
    currentToken = null;
    if (typeof window !== 'undefined') {
      window.Echo = undefined;
    }
  }
}
