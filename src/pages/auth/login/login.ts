import type { ILogin } from '../../../types/ILogin';
import type { IUser } from '../../../types/IUser';
import { saveUser } from '../../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

/** Llama al backend y devuelve el usuario autenticado */
export async function loginUser(data: ILogin): Promise<IUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Error al iniciar sesión: ${errorMsg}`);
  }

  const result: IUser = await response.json();
  return result;
}

/** Manejo del formulario de login + guardado + redirección por rol */
const form = document.getElementById('form') as HTMLFormElement | null;
const email = document.getElementById('email') as HTMLInputElement | null;
const password = document.getElementById('password') as HTMLInputElement | null;
const errorEl = document.getElementById('error') as HTMLParagraphElement | null;

if (form && email && password) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }

    try {
      const user = await loginUser({ email: email.value, password: password.value });
      saveUser(user);

      if (user.role === 'admin') {
        window.location.href = '/src/pages/admin/adminHome/adminHome.html';
      } else {
        window.location.href = '/src/pages/store/home/home.html';
      }
    } catch (err: any) {
      if (errorEl) {
        errorEl.textContent = err?.message || 'Error de autenticación';
        errorEl.classList.remove('hidden');
      } else {
        alert(err?.message || 'Error de autenticación');
      }
    }
  });
}