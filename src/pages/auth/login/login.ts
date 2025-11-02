import { saveUser, goToRoleHome } from '../../../utils/auth';

const API_BASE = 'http://localhost:8080/api/usuarios';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mail: email,
          contrasena: password
        })
      });

      if (!response.ok) {
        throw new Error('Email o contraseña incorrectos');
      }

      const usuario = await response.json();
      console.log('Usuario recibido:', usuario);

      const rol = usuario.rol.toLowerCase();
      const userData = {
        id: usuario.id,
        email: usuario.mail,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: rol === 'admin' ? 'admin' : 'cliente'
      };

      saveUser(userData);
      goToRoleHome();

    } catch (err: any) {
      console.error('Error en login:', err);
      alert('Error: ' + err.message);
    }
  });
});