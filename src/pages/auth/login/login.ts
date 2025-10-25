import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;

    if (!loginForm) {
        console.error("No se encontró el formulario loginForm");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const message = await post('login', { mail: email, contrasena: password });
            alert(message);

            saveUser({ email });
            window.location.href = '/src/pages/dashboard.html'; // tu dashboard
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    });
});
