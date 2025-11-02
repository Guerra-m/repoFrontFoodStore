import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';
import { goToRoleHome } from '../../../utils/navigate';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Login.ts cargado');

  const loginForm = document.getElementById('loginForm') as HTMLFormElement;
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const usuario = await post('login', { mail: email, contrasena: password });
      console.log('Usuario recibido del backend:', usuario);

      // Tomamos el rol real del usuario
      const rol = (usuario?.rol || 'cliente').toLowerCase() as 'admin' | 'cliente';

      console.log('Guardando usuario:', { email, rol, name: usuario?.nombre });

      saveUser({ email, rol, name: usuario?.nombre || '' });
      goToRoleHome({ email, rol, name: usuario?.nombre || '' });
    } catch (err: any) {
      console.error('Error en login:', err);
      alert('Error: ' + err.message);
    }
  });
});
