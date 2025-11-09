import { GET } from '@/utils/api';
import { logout, requireAdmin, getUser } from '@/utils/auth';

requireAdmin();

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

const qs = <T extends Element>(s: string) => document.querySelector(s) as T;

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content && Array.isArray(res.content)) return res.content;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

async function load() {
  try {
    // Llamadas a la API
    const cats = norm(await GET('/categorias'));
    const prods = norm(await GET('/productos'));
    const pedidos = norm(await GET('/pedidos')); // 👈 agregado

    // Elementos del DOM
    const catCount = qs<HTMLElement>('#cCategorias');
    const prodCount = qs<HTMLElement>('#cProductos');
    const pedidoCount = qs<HTMLElement>('#cPedidos');
    const dispCount = qs<HTMLElement>('#cDisponibles');
    const resumen = qs<HTMLElement>('#resumenTexto');

    // Actualizar contadores
    if (catCount) catCount.textContent = String(cats.length);
    if (prodCount) prodCount.textContent = String(prods.length);
    if (pedidoCount) pedidoCount.textContent = String(pedidos.length); // ✅ ahora muestra los pedidos reales

    const totalStock = prods.reduce((sum: number, p: any) => sum + Number(p.stock || 0), 0);
    const disponibles = prods.filter((p: any) => p.disponible !== false).length;

    if (dispCount) dispCount.textContent = String(disponibles);

    // Texto de resumen
    if (resumen) {
      resumen.innerHTML = `
        <strong>Estado actual:</strong><br>
        • ${cats.length} categorías registradas<br>
        • ${prods.length} productos en total<br>
        • ${disponibles} productos disponibles<br>
        • ${pedidos.length} pedidos registrados<br> <!-- 👈 agregado -->
        • ${totalStock} unidades en stock
      `;
    }

  } catch (e) {
    console.error('Error:', e);
    const resumen = qs<HTMLElement>('#resumenTexto');
    if (resumen) {
      resumen.textContent = 'Error al cargar datos. Verifica que el backend esté corriendo.';
    }
  }
}

load();
