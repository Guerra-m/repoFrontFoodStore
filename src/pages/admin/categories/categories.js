document.addEventListener("DOMContentLoaded", () => {
  const btnNueva = document.getElementById("btnNueva");
  const modal = document.getElementById("modalCategoria");
  const btnCancelar = document.getElementById("btnCancelar");
  const tablaBody = document.querySelector("#tablaCategorias tbody");

  // Fila de ejemplo
  const ejemplo = {
    id: 1,
    nombre: "Pizzas",
    descripcion: "Categoría de todas las pizzas",
    imagen: "https://via.placeholder.com/50"
  };

  if(tablaBody){
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${ejemplo.id}</td>
      <td><img src="${ejemplo.imagen}" alt="${ejemplo.nombre}"></td>
      <td>${ejemplo.nombre}</td>
      <td>${ejemplo.descripcion}</td>
      <td>
        <button class="btn-editar">Editar</button>
        <button class="btn-eliminar">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  }

  btnNueva.addEventListener("click", () => {
    modal.classList.remove("oculto");
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });
});
