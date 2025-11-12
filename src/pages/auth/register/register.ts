import { POST } from "@/utils/api";

const form = document.getElementById("registerForm") as HTMLFormElement;

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = (
    document.getElementById("nombre") as HTMLInputElement
  ).value.trim();
  const apellido = (
    document.getElementById("apellido") as HTMLInputElement
  ).value.trim();
  const email = (
    document.getElementById("email") as HTMLInputElement
  ).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const rol = (document.getElementById("rol") as HTMLSelectElement).value;

  try {
    await POST("/usuarios/registro", {
      nombre,
      apellido,
      mail: email,
      contrasena: password,
      rol: rol,
      celular: 0,
    });
    localStorage.setItem(
      "registroExitoso",
      `¡Registro exitoso como ${rol === "ADMIN" ? "Administrador" : "Cliente"}!`
    );
    window.location.href = "/src/pages/auth/login/login.html";
  } catch (err: any) {
    console.error("Error en registro:", err);
    alert("Error: " + err.message);
  }
});
