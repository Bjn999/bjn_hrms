
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const language = typeof window !== 'undefined' ? (localStorage.getItem('app_language') || 'ar') : 'ar';
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': language,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    return;
  }

  if (response.status === 403) {
    try {
      const cloned = response.clone();
      const body = await cloned.json();
      if (body.code === 'SUBSCRIPTION_SUSPENDED' || body.grace_period_ended) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login?reason=subscription_expired';
        return;
      }
    } catch {
      // Pass through if not json
    }
  }

  return response;
}
