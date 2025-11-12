import { saveUser, goToRoleHome } from "../../../utils/auth";

const API_BASE = "http://localhost:8080/api/usuarios";
//alerta usuario registrado
document.addEventListener("DOMContentLoaded", () => {
  const mensaje = localStorage.getItem("registroExitoso");
  if (mensaje) {
    // buscamos el contenedor del formulario de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      // creamos el mensaje
      const toast = document.createElement("div");
      toast.className = "toast-message";
      toast.textContent = mensaje;
      toast.style.cssText = `
        margin-top: 10px;
        background: #00b894;
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        text-align: center;
        font-weight: 500;
        animation: fadeIn 0.4s ease;
      `;

      // insertamos justo después del formulario
      loginForm.insertAdjacentElement("afterend", toast);

      // eliminamos el mensaje luego de unos segundos
      setTimeout(() => {
        toast.style.animation = "fadeOut 0.4s ease forwards";
        setTimeout(() => toast.remove(), 400);
      }, 2000);
    }

    // limpiamos el localStorage para que no se repita
    localStorage.removeItem("registroExitoso");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (
      document.getElementById("email") as HTMLInputElement
    ).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail: email,
          contrasena: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Email o contraseña incorrectos");
      }

      const usuario = await response.json();
      console.log("Usuario recibido:", usuario);

      const rol = usuario.rol.toLowerCase();
      const userData = {
        id: usuario.id,
        email: usuario.mail,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: rol === "admin" ? "admin" : "cliente",
      };

      saveUser(userData);
      goToRoleHome();
    } catch (err: any) {
      console.error("Error en login:", err);
      //alert('Error: ' + err.message) error de login;
      const passwordInput = document.getElementById(
        "password"
      ) as HTMLInputElement;

      const oldMessage = document.querySelector(".toast-message");
      if (oldMessage) oldMessage.remove();

      const message = document.createElement("div");
      message.className = "toast-message";
      message.textContent = err.message;
      message.style.cssText = `
        margin-top:8px; 
        margin-bottom: -28px;  
        background: #c54c4cff;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      passwordInput.insertAdjacentElement("afterend", message);

      setTimeout(() => {
        message.style.animation = "slideOut 0.3s ease";
        setTimeout(() => message.remove(), 300);
      }, 2000);
    }
  });
});
