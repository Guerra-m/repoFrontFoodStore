var nombre:string = "pepe";
console.log(nombre)

import type { ILogin } from "./types/ILogin";

const BASE_URL = "http://localhost:8080/api/auth";

export async function loginUser(data: ILogin) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al iniciar sesión");
  }

  return response.json();
}