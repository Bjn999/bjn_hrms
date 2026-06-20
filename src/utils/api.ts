
export const API_URL = 'http://localhost:8000/api/admin';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
    return;
  }

  return response;
}
