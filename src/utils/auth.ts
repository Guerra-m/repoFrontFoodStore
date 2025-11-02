// src/utils/auth.ts
export interface SessionUser {
  id?: number;
  name?: string;
  apellido?: string;
  email: string;
  rol: 'admin' | 'cliente';
}

const KEY = 'user';

export function saveUser(user: SessionUser) {
  console.log('saveUser ejecutado', user); 
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
  return !!u && u.rol === role;
}

export function requireLogin(): boolean {
  const u = getUser();
  return !!u;
}

export function requireRole(role: 'admin'|'cliente'): boolean {
  const u = getUser();
  if (!u) return false;
  return u.rol === role;
}




export function logout() {
  localStorage.removeItem(KEY);
  window.location.replace('/src/pages/auth/login/login.html');
}
