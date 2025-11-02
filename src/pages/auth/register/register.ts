import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';
import { goToRoleHome } from '../../../utils/navigate';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm') as HTMLFormElement;
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const usuario = await post('registro', { nombre,apellido, mail: email, contrasena: password });

      // Tomamos el rol desde la respuesta o asumimos "cliente" por defecto
      const rol = (usuario?.rol || 'cliente').toLowerCase() as 'admin' | 'cliente';
      // 👇 Incluimos también el apellido en los datos guardados y enviados
      const userData = {
        email,
        rol,
        nombre: usuario?.nombre || nombre,
        apellido: usuario?.apellido || apellido,
      };

      saveUser(userData);
      goToRoleHome({ email, rol, name: usuario?.nombre || nombre });
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
});
