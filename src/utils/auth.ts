//src/utils/auth.ts
export interface UserData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'cliente';
}

export function saveUser(userData: UserData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

export function getUser(): UserData | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.rol === 'admin';
}

export function isClient(): boolean {
  const user = getUser();
  return user?.rol === 'cliente';
}

export function logout() {
  localStorage.clear();
  window.location.href = '/src/pages/auth/login/login.html';
}

export function requireAdmin() {
  const user = getUser();
  if (!user) {
    alert('Debes iniciar sesión');
    window.location.href = '/src/pages/auth/login/login.html';
    return;
  }
  if (user.rol !== 'admin') {
    alert('Acceso denegado. Solo administradores.');
    window.location.href = '/src/pages/store/home/home.html';
  }
}

export function requireAuth() {
  const user = getUser();
  if (!user) {
    alert('Debes iniciar sesión');
    window.location.href = '/src/pages/auth/login/login.html';
  }
}

export function goToRoleHome() {
  const user = getUser();
  if (!user) {
    window.location.href = '/src/pages/auth/login/login.html';
    return;
  }
  if (user.rol === 'admin') {
    window.location.href = '/src/pages/admin/adminHome/adminHome.html';
  } else {
    window.location.href = '/src/pages/store/home/home.html';
  }
}