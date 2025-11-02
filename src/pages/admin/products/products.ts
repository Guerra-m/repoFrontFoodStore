import { GET, POST, PUT, DEL } from '@/utils/api';
import { logout, requireAdmin, getUser } from '@/utils/auth';
import type { IProduct } from '@/types/IProduct';
import type { ICategoria } from '@/types/ICategoria';

requireAdmin();

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

const qs = <T extends Element>(s: string) => document.querySelector(s) as T;

const tablaBody = qs<HTMLTableSectionElement>('#tablaProductos tbody');
const modal = qs<HTMLElement>('#modalProducto');
const form = qs<HTMLFormElement>('#formProducto');
const tituloModal = qs<HTMLElement>('#tituloModal');
const btnNuevo = qs<HTMLButtonElement>('#btnNuevo');
const cerrarModal = qs<HTMLButtonElement>('#cerrarModal');

let editandoId: number | null = null;

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

function row(p: IProduct): string {
  return `<tr data-id='${p.id}'>
    <td>${p.id}</td>
    <td>${p.imagen ? `<img src='${p.imagen}' alt='${p.nombre}' style='width:50px;height:50px;object-fit:cover;border-radius:8px'>` : ''}</td>
    <td>${p.nombre}</td>
    <td>${p.descripcion || ''}</td>
    <td>$${p.precio}</td>
    <td>${p.categoriaNombre || p.categoriaId}</td>
    <td>${p.stock}</td>
    <td>${p.disponible ? '<span style="color:#00b894">✓ Disponible</span>' : '<span style="color:#d63031">✗ No disponible</span>'}</td>
    <td>
      <button class='btn-editar' data-id='${p.id}'>Editar</button>
      <button class='btn-eliminar' data-id='${p.id}'>Eliminar</button>
    </td>
  </tr>`;
}

async function load() {
  try {
    const res: any = await GET('/productos');
    const prods = norm<IProduct>(res);
    tablaBody.innerHTML = prods.map(row).join('');
    agregarEventos();
  } catch (e) {
    console.error('Error:', e);
    alert('Error al cargar productos');
  }
}

async function cargarCategorias(selectedId?: number) {
  try {
    const res: any = await GET('/categorias');
    const cats = norm<ICategoria>(res);
    const select = qs<HTMLSelectElement>('#categoriaId');
    select.innerHTML = '<option value="">Selecciona una categoría</option>' +
      cats.map(c => `<option value='${c.id}' ${c.id === selectedId ? 'selected' : ''}>${c.nombre}</option>`).join('');
  } catch (e) {
    console.error('Error al cargar categorías:', e);
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
        const prod = await GET<IProduct>(`/productos/${id}`);
        abrirModalEditar(prod);
      } catch (error) {
        console.error('Error al obtener producto:', error);
        alert('Error al cargar el producto');
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
        alert('ID de producto no válido');
        return;
      }
      
      if (confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
        try {
          await DEL(`/productos/${id}`);
          alert('Producto eliminado exitosamente');
          await load();
        } catch (error) {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el producto');
        }
      }
    });
  });
}

async function abrirModalNuevo() {
  form.reset();
  tituloModal.textContent = 'Nuevo Producto';
  editandoId = null;
  (qs<HTMLInputElement>('#disponible')).checked = true;
  await cargarCategorias();
  modal.classList.remove('oculto');
}

async function abrirModalEditar(prod: IProduct) {
  editandoId = prod.id;
  tituloModal.textContent = `Editar Producto #${prod.id}`;
  
  (qs<HTMLInputElement>('#nombre')).value = prod.nombre;
  (qs<HTMLTextAreaElement>('#descripcion')).value = prod.descripcion || '';
  (qs<HTMLInputElement>('#precio')).value = String(prod.precio);
  (qs<HTMLInputElement>('#stock')).value = String(prod.stock);
  (qs<HTMLInputElement>('#imagen')).value = prod.imagen || '';
  (qs<HTMLInputElement>('#disponible')).checked = prod.disponible !== false;
  
  await cargarCategorias(prod.categoriaId);
  modal.classList.remove('oculto');
}

btnNuevo.addEventListener('click', abrirModalNuevo);
cerrarModal.addEventListener('click', () => modal.classList.add('oculto'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nombre = (qs<HTMLInputElement>('#nombre')).value.trim();
  const descripcion = (qs<HTMLTextAreaElement>('#descripcion')).value.trim();
  const precio = Number((qs<HTMLInputElement>('#precio')).value);
  const stock = Number((qs<HTMLInputElement>('#stock')).value);
  const categoriaId = Number((qs<HTMLSelectElement>('#categoriaId')).value);
  const imagen = (qs<HTMLInputElement>('#imagen')).value.trim();
  const disponible = (qs<HTMLInputElement>('#disponible')).checked;

  if (!nombre || !precio || !stock || !categoriaId) {
    alert('Complete todos los campos obligatorios');
    return;
  }

  const payload: any = {
    nombre,
    descripcion,
    precio,
    stock,
    categoriaId,
    imagen: imagen || undefined,
    disponible
  };

  try {
    if (editandoId === null) {
      await POST('/productos', payload);
      alert('Producto creado exitosamente');
    } else {
      await PUT(`/productos/${editandoId}`, payload);
      alert('Producto actualizado exitosamente');
    }
    modal.classList.add('oculto');
    await load();
  } catch (e) {
    console.error('Error:', e);
    alert('Error al guardar producto');
  }
});

load();