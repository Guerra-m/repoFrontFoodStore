// src/pages/admin/orders/orders.ts
import { GET, PUT } from '@/utils/api';
import { logout, requireAdmin, getUser } from '@/utils/auth';
import type { IPedido } from '@/types/IOrders';

requireAdmin();

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

let currentFilter = 'TODOS';

// Normaliza la respuesta del backend
function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

// Traducción de estado al texto mostrado
function getStatusText(estado: string): string {
  const estados: Record<string, string> = {
    'PENDIENTE': '⏳ Pendiente',
    'CONFIRMADO': '✅ Confirmado',
    'CANCELADO': '❌ Cancelado',
    'TERMINADO': '🚚 Terminado'
  };
  return estados[estado] || estado;
}

async function loadOrders() {
  const container = document.getElementById('ordersContent')!;
  container.innerHTML = '<div class="loading">⏳ Cargando pedidos...</div>';

  try {
    const res: any = await GET('/pedidos');
    console.log('Respuesta completa del backend:', res);

    let pedidos = norm<IPedido>(res);

    if (!Array.isArray(pedidos)) {
      console.error('⚠️ Error: la respuesta no es un array. Valor:', pedidos);
      pedidos = [];
    }

    console.log('Pedidos normalizados:', pedidos);

    // Filtrar según el estado seleccionado
    if (currentFilter !== 'TODOS') {
      pedidos = pedidos.filter(p => p.estado === currentFilter);
    }

    if (pedidos.length === 0) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-icon">📦</div>
          <h2>No hay pedidos ${currentFilter !== 'TODOS' ? 'con este estado' : ''}</h2>
          <p>Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
        </div>
      `;
      return;
    }

    // Ordenar por fecha descendente
    pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // 🔹 Renderizar pedidos
    container.innerHTML = pedidos.map(pedido => {
      if (!pedido) return ''; // Evita errores si el pedido es undefined
      const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : []; // Siempre array

      return `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Pedido #${pedido.id}</h3>
              <p class="order-client">👤 Cliente: ${pedido.usuarioNombre || 'Usuario #' + pedido.usuarioId}</p>
              <p class="order-date">📅 ${new Date(pedido.fecha).toLocaleDateString('es-ES', {
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

            <!-- 🔹 BOTONES ACTUALIZADOS -->
            <div class="order-actions">
              <button 
                class="btn-approve" 
                onclick="updateOrderStatus(${pedido.id}, 'CONFIRMADO')"
                ${pedido.estado !== 'PENDIENTE' ? 'disabled' : ''}
              >
                ✅ Confirmar
              </button>
              <button 
                class="btn-reject" 
                onclick="updateOrderStatus(${pedido.id}, 'CANCELADO')"
                ${pedido.estado !== 'PENDIENTE' ? 'disabled' : ''}
              >
                ❌ Cancelar
              </button>
              <button 
                class="btn-deliver" 
                onclick="updateOrderStatus(${pedido.id}, 'TERMINADO')"
                ${pedido.estado !== 'CONFIRMADO' ? 'disabled' : ''}
              >
                🚚 Terminar
              </button>
            </div>
          </div>

          <div class="order-items">
            <div class="order-items-header">
              <span>Producto</span>
              <span style="text-align:right;">Cantidad</span>
              <span style="text-align:right;">Precio Unit.</span>
              <span style="text-align:right;">Subtotal</span>
            </div>
            ${detalles.map(item => `
              <div class="order-item">
                <span class="item-name">${item.productoNombre}</span>
                <span class="item-qty">${item.cantidad}</span>
                <span class="item-price">$${item.precio.toFixed(2)}</span>
                <span class="item-subtotal">$${item.subtotal.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">$${pedido.total.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');

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

// 🔹 FUNCIÓN GLOBAL PARA ACTUALIZAR ESTADO
(window as any).updateOrderStatus = async (pedidoId: number, nuevoEstado: string) => {
  const confirmMessages: Record<string, string> = {
    'CONFIRMADO': '¿Confirmar este pedido?',
    'CANCELADO': '¿Cancelar este pedido?',
    'TERMINADO': '¿Marcar como terminado?'
  };

  if (confirm(confirmMessages[nuevoEstado] || '¿Continuar?')) {
    try {
      await PUT(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      alert('✅ Estado actualizado correctamente');
      await loadOrders();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('❌ Error al actualizar el estado del pedido');
    }
  }
};

// 🔹 Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    (e.target as HTMLElement).classList.add('active');
    currentFilter = (e.target as HTMLElement).dataset.status || 'TODOS';
    loadOrders();
  });
});

loadOrders();
