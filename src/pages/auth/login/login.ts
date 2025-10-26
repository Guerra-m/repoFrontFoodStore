// src/pages/auth/login/login.ts
import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';
import { goToRoleHome } from '../../../utils/navigate';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await post('login', { mail: email, contrasena: password });
      const role = email.trim().toLowerCase() === 'admin@food.com' ? 'admin' : 'cliente';
      saveUser({ email, role });
      goToRoleHome({ email, role });
    } catch (err: any) {
      console.error('Error en login:', err);
      alert('Error: ' + err.message);
    }
  });
});
