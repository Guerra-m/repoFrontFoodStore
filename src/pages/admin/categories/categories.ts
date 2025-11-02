import { GET, POST, PUT, DEL } from '@/utils/api';
import { logout, requireAdmin, getUser } from '@/utils/auth';
import type { ICategoria } from '@/types/ICategoria';

requireAdmin();

const user = getUser();
if (user) {
  const userName = document.querySelector('.user');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

const qs = <T extends Element>(s: string) => document.querySelector(s) as T;

const tablaBody = qs<HTMLTableSectionElement>('#tablaCategorias tbody');
const modal = qs<HTMLElement>('#modalCategoria');
const modalEditar = qs<HTMLElement>('#modalEditarCategoria');
const form = qs<HTMLFormElement>('#formCategoria');
const formEditar = qs<HTMLFormElement>('#formEditarCategoria');
const tituloModal = qs<HTMLElement>('#tituloModal');
const btnNueva = qs<HTMLButtonElement>('#btnNueva');
const btnCancelar = qs<HTMLButtonElement>('#btnCancelar');
const cerrarEditar = qs<HTMLButtonElement>('#cerrarEditar');

let editandoId: number | null = null;

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

function row(c: ICategoria): string {
  return `<tr data-id='${c.id}'>
    <td>${c.id}</td>
    <td>${c.imagen ? `<img src='${c.imagen}' alt='${c.nombre}'>` : ''}</td>
    <td>${c.nombre}</td>
    <td>${c.descripcion || ''}</td>
    <td>
      <button class='btn-editar' data-id='${c.id}'>Editar</button>
      <button class='btn-eliminar' data-id='${c.id}'>Eliminar</button>
    </td>
  </tr>`;
}

async function load() {
  try {
    const res: any = await GET('/categorias');
    const cats = norm<ICategoria>(res);
    tablaBody.innerHTML = cats.map(row).join('');
    agregarEventos();
  } catch (e) {
    console.error('Error:', e);
    alert('Error al cargar categorías');
  }
}

function agregarEventos() {
  // Botones de editar
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number((e.target as HTMLElement).dataset.id);
      try {
        const cat = await GET<ICategoria>(`/categorias/${id}`);
        abrirModalEditar(cat);
      } catch (error) {
        console.error('Error al obtener categoría:', error);
        alert('Error al cargar la categoría');
      }
    });
  });

  // Botones de eliminar
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const btnElement = e.target as HTMLElement;
      const tr = btnElement.closest('tr');
      if (!tr) return;
      
      const nombre = tr.children[2]?.textContent || '';
      const id = Number(tr.dataset.id);
      
      if (!id) {
        alert('ID de categoría no válido');
        return;
      }
      
      if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
        try {
          await DEL(`/categorias/${id}`);
          alert('Categoría eliminada exitosamente');
          await load();
        } catch (error) {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar la categoría. Puede que tenga productos asociados.');
        }
      }
    });
  });
}

function abrirModalNueva() {
  form.reset();
  tituloModal.textContent = 'Nueva Categoría';
  editandoId = null;
  modal.classList.remove('oculto');
}

function abrirModalEditar(cat: ICategoria) {
  editandoId = cat.id;
  (qs<HTMLInputElement>('#editarNombre')).value = cat.nombre;
  (qs<HTMLTextAreaElement>('#editarDescripcion')).value = cat.descripcion || '';
  (qs<HTMLInputElement>('#editarImagen')).value = cat.imagen || '';
  modalEditar.classList.remove('oculto');
}

btnNueva.addEventListener('click', abrirModalNueva);
btnCancelar.addEventListener('click', () => modal.classList.add('oculto'));
cerrarEditar.addEventListener('click', () => modalEditar.classList.add('oculto'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nombre = (qs<HTMLInputElement>('#nombre')).value.trim();
  const descripcion = (qs<HTMLInputElement>('#descripcion')).value.trim();
  const imagen = (qs<HTMLInputElement>('#imagen')).value.trim();

  if (!nombre) {
    alert('El nombre es obligatorio');
    return;
  }

  const payload = { nombre, descripcion, imagen: imagen || undefined };

  try {
    await POST('/categorias', payload);
    alert('Categoría creada exitosamente');
    modal.classList.add('oculto');
    await load();
  } catch (e) {
    console.error('Error:', e);
    alert('Error al crear categoría');
  }
});

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (editandoId === null) return;

  const nombre = (qs<HTMLInputElement>('#editarNombre')).value.trim();
  const descripcion = (qs<HTMLTextAreaElement>('#editarDescripcion')).value.trim();
  const imagen = (qs<HTMLInputElement>('#editarImagen')).value.trim();

  if (!nombre) {
    alert('El nombre es obligatorio');
    return;
  }

  const payload = { nombre, descripcion, imagen: imagen || undefined };

  try {
    await PUT(`/categorias/${editandoId}`, payload);
    alert('Categoría actualizada exitosamente');
    modalEditar.classList.add('oculto');
    await load();
  } catch (e) {
    console.error('Error:', e);
    alert('Error al actualizar categoría');
  }
});

load();