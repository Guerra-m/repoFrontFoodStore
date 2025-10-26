// src/pages/auth/register/register.ts
import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';
import { goToRoleHome } from '../../../utils/navigate';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm') as HTMLFormElement;
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const usuario = await post('registro', { nombre, mail: email, contrasena: password });
      const role: 'cliente' = 'cliente';
      saveUser({ email, role, name: (usuario?.nombre || nombre) });
      goToRoleHome({ email, role, name: (usuario?.nombre || nombre) });
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
});
