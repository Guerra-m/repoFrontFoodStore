import { post } from '../../../utils/api';
import { saveUser } from '../../../utils/auth';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;

    if (!registerForm) {
        console.error("No se encontró el formulario registerForm");
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const usuario = await post('registro', { nombre, mail: email, contrasena: password });
            alert('Usuario registrado: ' + usuario.nombre);

            saveUser(usuario);
            window.location.href = '/src/pages/auth/login/login.html';
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    });
});
