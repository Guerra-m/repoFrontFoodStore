import { GET } from '@/utils/api';
import { logout, requireAuth, getUser } from '@/utils/auth';
import { getCart } from '@/utils/cart';
import type { IPedido } from '@/types/IOrders';

requireAuth();

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

// Actualizar badge del carrito
function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  
  if (badge) {
    if (totalItems > 0) {
      badge.textContent = String(totalItems);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

function getStatusText(estado: string): string {
  const estados: Record<string, string> = {
    'PENDIENTE': '⏳ Pendiente',
    'APROBADO': '✅ Aprobado',
    'RECHAZADO': '❌ Rechazado',
    'ENTREGADO': '🚚 Entregado'
  };
  return estados[estado] || estado;
}

async function loadOrders() {
  const container = document.getElementById('ordersContent')!;
  
  try {
    const currentUser = getUser();
    if (!currentUser) {
      window.location.href = '/src/pages/auth/login/login.html';
      return;
    }

    const res: any = await GET(`/pedidos/usuario/${currentUser.id}`);
    const pedidos = norm<IPedido>(res);

    if (pedidos.length === 0) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-icon">📦</div>
          <h2>No tienes pedidos aún</h2>
          <p>Realiza tu primer pedido y aparecerá aquí</p>
          <button class="btn-shop" onclick="window.location.href='/src/pages/store/home/home.html'">
            Ir a la tienda
          </button>
        </div>
      `;
      return;
    }

    // Ordenar por fecha descendente (más reciente primero)
    pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    container.innerHTML = pedidos.map(pedido => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Pedido #${pedido.id}</h3>
            <p class="order-date">${new Date(pedido.fecha).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <span class="order-status status-${pedido.estado}">
            ${getStatusText(pedido.estado)}
          </span>
        </div>

        <div class="order-items">
          ${pedido.items.map(item => `
            <div class="order-item">
              <span class="item-name">${item.productoNombre}</span>
              <span class="item-qty">Cantidad: ${item.cantidad}</span>
              <span class="item-price">$${item.precio.toFixed(2)} c/u</span>
              <span class="item-subtotal">$${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="order-total">
          <span class="total-label">Total:</span>
          <span class="total-amount">$${pedido.total.toFixed(2)}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">⚠️</div>
        <h2>Error al cargar pedidos</h2>
        <p>Intenta recargar la página</p>
      </div>
    `;
  }
}

updateCartBadge();
loadOrders();