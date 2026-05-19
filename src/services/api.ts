export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5200';

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const AUTH_ENDPOINTS = {
  me: apiUrl('/api/auth/me'),
  logout: apiUrl('/api/auth/logout'),
  githubLogin: apiUrl('/api/auth/github/login'),
};

export function getGitHubLoginUrl() {
  const returnUrl = `${window.location.origin}${window.location.pathname}`;

  return `${AUTH_ENDPOINTS.githubLogin}?returnUrl=${encodeURIComponent(returnUrl)}`;
}
