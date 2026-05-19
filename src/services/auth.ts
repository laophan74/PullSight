import { AUTH_ENDPOINTS } from './api';

export type AuthUser = {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatarUrl: string;
  profileUrl: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(AUTH_ENDPOINTS.me, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to load the current GitHub user.');
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(AUTH_ENDPOINTS.logout, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 401) {
    throw new Error('Unable to log out.');
  }
}
