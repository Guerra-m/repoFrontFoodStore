// src/utils/auth.ts
export interface SessionUser {
  id?: number;
  name?: string;
  email: string;
  role: 'admin' | 'cliente';
}

const KEY = 'user';

export function saveUser(user: SessionUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): SessionUser | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

export function hasRole(role: 'admin'|'cliente'): boolean {
  const u = getUser();
  return !!u && u.role === role;
}

export function requireLogin() {
  if (!isLoggedIn()) {
    window.location.replace('/src/pages/auth/login/login.html');
  }
}

export function requireRole(role: 'admin'|'cliente') {
  requireLogin();
  const u = getUser();
  if (!u) return;
  if (u.role !== role) {
    if (u.role === 'admin') {
      window.location.replace('/src/pages/admin/adminHome/adminHome.html');
    } else {
      window.location.replace('/src/pages/store/home/home.html');
    }
  }
}

export function logout() {
  localStorage.removeItem(KEY);
  window.location.replace('/src/pages/auth/login/login.html');
}
