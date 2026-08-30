
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
    window.location.href = '/login';
    return;
  }

  return response;
}
