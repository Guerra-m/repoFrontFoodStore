// src/utils/navigate.ts
import type { SessionUser } from './auth';

export function goToRoleHome(user: SessionUser) {
  if (user.role === 'admin') {
    window.location.replace('/src/pages/admin/adminHome/adminHome.html');
  } else {
    window.location.replace('/src/pages/store/home/home.html');
  }
}
