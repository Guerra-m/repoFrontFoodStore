import type { IUser } from '../../../types/IUser';
import { saveUser } from '../../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

async function registerUser(data: { name: string; email: string; password: string }): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error al registrarse: ${msg}`);
  }
}

async function loginAfterRegister(email: string, password: string): Promise<IUser> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error al iniciar sesión: ${msg}`);
  }
  return res.json();
}

const form = document.getElementById('form') as HTMLFormElement | null;
const nameEl = document.getElementById('name') as HTMLInputElement | null;
const emailEl = document.getElementById('email') as HTMLInputElement | null;
const passwordEl = document.getElementById('password') as HTMLInputElement | null;
const errorEl = document.getElementById('error') as HTMLParagraphElement | null;

if (form && nameEl && emailEl && passwordEl) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }
    try {
      await registerUser({ name: nameEl.value, email: emailEl.value, password: passwordEl.value });
      const user = await loginAfterRegister(emailEl.value, passwordEl.value);
      saveUser(user);
      window.location.href = '/src/pages/store/home/home.html';
    } catch (err: any) {
      if (errorEl) {
        errorEl.textContent = err?.message || 'Error al registrarse';
        errorEl.classList.remove('hidden');
      } else {
        alert(err?.message || 'Error al registrarse');
      }
    }
  });
}