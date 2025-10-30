interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, inicializando categorías...");
  inicializarApp();
});

function inicializarApp() {
  const tablaBody = document.querySelector<HTMLTableSectionElement>("#tablaCategorias tbody");
  const modal = document.getElementById("modalCategoria");
  const form = document.getElementById("formCategoria") as HTMLFormElement;
  const btnNueva = document.getElementById("btnNueva");
  const btnCancelar = document.getElementById("btnCancelar");
  const tituloModal = document.getElementById("tituloModal");
  const modalEditar = document.getElementById("modalEditarCategoria");
  const formEditar = document.getElementById("formEditarCategoria") as HTMLFormElement;
  const cerrarEditar = document.getElementById("cerrarEditar");

  if (!tablaBody || !modal || !form || !btnNueva || !btnCancelar || !tituloModal || !modalEditar || !formEditar || !cerrarEditar) {
    console.error("Error: No se encontraron elementos necesarios del DOM");
    return;
  }

  let categorias: Categoria[] = JSON.parse(localStorage.getItem("categorias") || "[]");
  let editandoId: number | null = null;

  // === Mostrar categorías ===
  function renderCategorias() {
    if (!tablaBody) return;
    tablaBody.innerHTML = "";
    categorias.forEach(cat => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cat.id}</td>
        <td><img src="${cat.imagen}" alt="${cat.nombre}"></td>
        <td>${cat.nombre}</td>
        <td>${cat.descripcion}</td>
        <td>
          <button class="btn-editar" data-id="${cat.id}">Editar</button>
          <button class="btn-eliminar" data-id="${cat.id}">Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(fila);
    });
    agregarEventosBotones();
  }

  function agregarEventosBotones() {
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = Number((e.target as HTMLElement).dataset.id);
        eliminarCategoria(id);
      });
    });

    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = Number((e.target as HTMLElement).dataset.id);
        editarCategoria(id);
      });
    });
  }

  function guardarLocal() {
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }

  // === Modal Nueva Categoría ===
  btnNueva.addEventListener("click", () => {
    form.reset();
    tituloModal.textContent = "Nueva Categoría";
    editandoId = null;
    modal.classList.remove("oculto");
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // === Crear / Editar categoría ===
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
    const descripcion = (document.getElementById("descripcion") as HTMLInputElement).value;
    const imagen = (document.getElementById("imagen") as HTMLInputElement).value;

    if (editandoId) {
      const index = categorias.findIndex(c => c.id === editandoId);
      categorias[index] = { id: editandoId, nombre, descripcion, imagen };
    } else {
      const nueva: Categoria = {
        id: categorias.length ? Math.max(...categorias.map(c => c.id)) + 1 : 1,
        nombre,
        descripcion,
        imagen
      };
      categorias.push(nueva);
    }

    guardarLocal();
    renderCategorias();
    modal.classList.add("oculto");
  });

  // === Modal Editar Categoría ===
  function editarCategoria(id: number) {
    const cat = categorias.find(c => c.id === id);
    if (!cat) return;

    editandoId = id;
    (document.getElementById("editarNombre") as HTMLInputElement).value = cat.nombre;
    (document.getElementById("editarDescripcion") as HTMLTextAreaElement).value = cat.descripcion;
    (document.getElementById("editarImagen") as HTMLInputElement).value = cat.imagen;

    modalEditar!.classList.remove("oculto");
  }

  cerrarEditar.addEventListener("click", () => {
    modalEditar.classList.add("oculto");
  });

  formEditar.addEventListener("submit", e => {
    e.preventDefault();

    if (editandoId === null) return;

    const nombre = (document.getElementById("editarNombre") as HTMLInputElement).value;
    const descripcion = (document.getElementById("editarDescripcion") as HTMLTextAreaElement).value;
    const imagen = (document.getElementById("editarImagen") as HTMLInputElement).value;

    const index = categorias.findIndex(c => c.id === editandoId);
    categorias[index] = { id: editandoId, nombre, descripcion, imagen };

    guardarLocal();
    renderCategorias();
    modalEditar.classList.add("oculto");
    editandoId = null;
  });

  // === Eliminar categoría ===
  function eliminarCategoria(id: number) {
    if (confirm("¿Seguro que quieres eliminar esta categoría?")) {
      categorias = categorias.filter(c => c.id !== id);
      guardarLocal();
      renderCategorias();
    }
  }

  // === Inicialización ===
  renderCategorias();
  console.log("Aplicación de categorías inicializada correctamente");
}
