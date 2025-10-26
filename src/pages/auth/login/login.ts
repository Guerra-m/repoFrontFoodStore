import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;

  if (!loginForm) {
    console.error('No se encontró el formulario loginForm');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      console.log('Intentando iniciar sesión con:', email);

      const response = await post('login', { mail: email, contrasena: password });

      console.log('Respuesta del backend:', response);
      alert(`Bienvenido ${email}`);

      saveUser({ email });

      // 👇 Usamos setTimeout para evitar recarga en cadena
      setTimeout(() => {
        window.location.replace('/src/pages/store/home/home.html'); //me redirige al home
      }, 300);

    } catch (err: any) {
      console.error('Error en login:', err);
      alert('Error: ' + err.message);
    }
  });
});
