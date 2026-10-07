const API_BASE_URL = 'http://localhost:3000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem('daf_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    const refreshToken = localStorage.getItem('daf_refresh_token');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('daf_access_token', data.accessToken);
        localStorage.setItem('daf_refresh_token', data.refreshToken);

        headers['Authorization'] = `Bearer ${data.accessToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        localStorage.removeItem('daf_access_token');
        localStorage.removeItem('daf_refresh_token');
        localStorage.removeItem('daf_user');
      }
    }
  }

  return response;
}