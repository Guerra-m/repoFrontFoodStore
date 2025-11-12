import { GET, PUT } from "@/utils/api";
import { logout, requireAdmin, getUser } from "@/utils/auth";
import type { IPedido } from "@/types/IOrders";
import { customAlertGeneral } from "@/utils/customAlertGeneral";
import { customConfirmGeneral } from "@/utils/customConfirmGeneral";

requireAdmin();

const user = getUser();
if (user) {
  const userName = document.getElementById("userName");
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document
  .getElementById("logout-btn")
  ?.addEventListener("click", () => logout());

let currentFilter = "TODOS";

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

function getStatusText(estado: string): string {
  const estados: Record<string, string> = {
    PENDIENTE: "⏳ Pendiente",
    APROBADO: "✅ Aprobado",
    RECHAZADO: "❌ Rechazado",
    ENTREGADO: "🚚 Entregado",
  };
  return estados[estado] || estado;
}

async function loadOrders() {
  const container = document.getElementById("ordersContent")!;

  container.innerHTML = '<div class="loading">⏳ Cargando pedidos...</div>';

  try {
    const res: any = await GET("/pedidos");
    let pedidos = norm<IPedido>(res);

    console.log("Pedidos cargados:", pedidos);

    // Filtrar según el estado seleccionado
    if (currentFilter !== "TODOS") {
      pedidos = pedidos.filter((p) => p.estado === currentFilter);
    }

    if (pedidos.length === 0) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-icon">📦</div>
          <h2>No hay pedidos ${
            currentFilter !== "TODOS" ? "con este estado" : ""
          }</h2>
          <p>Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
        </div>
      `;
      return;
    }

    // Ordenar por fecha descendente (más reciente primero)
    pedidos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    container.innerHTML = pedidos
      .map(
        (pedido) => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Pedido #${pedido.id}</h3>
            <p class="order-client">👤 Cliente: ${
              pedido.usuarioNombre || "Usuario #" + pedido.usuarioId
            }</p>
            <p class="order-date">📅 ${new Date(
              pedido.fecha
            ).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
          <span class="order-status status-${pedido.estado}">
            ${getStatusText(pedido.estado)}
          </span>
          <div class="order-actions">
            <button 
              class="btn-approve" 
              onclick="updateOrderStatus(${pedido.id}, 'APROBADO')"
              ${pedido.estado !== "PENDIENTE" ? "disabled" : ""}
            >
              ✅ Aprobar
            </button>
            <button 
              class="btn-reject" 
              onclick="updateOrderStatus(${pedido.id}, 'RECHAZADO')"
              ${pedido.estado !== "PENDIENTE" ? "disabled" : ""}
            >
              ❌ Rechazar
            </button>
            <button 
              class="btn-deliver" 
              onclick="updateOrderStatus(${pedido.id}, 'ENTREGADO')"
              ${pedido.estado !== "APROBADO" ? "disabled" : ""}
            >
              🚚 Entregar
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
          ${pedido.items
            .map(
              (item) => `
            <div class="order-item">
              <span class="item-name">${item.productoNombre}</span>
              <span class="item-qty">${item.cantidad}</span>
              <span class="item-price">$${item.precio.toFixed(2)}</span>
              <span class="item-subtotal">$${item.subtotal.toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="order-total">
          <span class="total-label">Total:</span>
          <span class="total-amount">$${pedido.total.toFixed(2)}</span>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">⚠️</div>
        <h2>Error al cargar pedidos</h2>
        <p>Intenta recargar la página</p>
      </div>
    `;
  }
}

(window as any).updateOrderStatus = async (
  pedidoId: string,
  nuevoEstado: string
) => {
  const confirmMessages: Record<string, string> = {
    APROBADO: "¿Aprobar este pedido?",
    RECHAZADO: "¿Rechazar este pedido?",
    ENTREGADO: "¿Marcar como entregado?",
  };
  //////
  async function updateOrderStatus(pedidoId: string, nuevoEstado: string) {
    const mensaje = confirmMessages[nuevoEstado] || "¿Continuar?";

    // Confirmación con modal personalizado
    const confirmed = await customConfirmGeneral(mensaje, nuevoEstado);

    if (!confirmed) return; // Si el usuario cancela, no hacemos nada

    try {
      // Petición para actualizar el estado (usando fetch)
      const response = await fetch(
        `http://localhost:8080/api/pedidos/${pedidoId}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar estado");
      }

      // Mostrar alerta de éxito
      customAlertGeneral(
        "Estado actualizado correctamente",
        "¡Éxito!",
        "success"
      );

      // Recargar pedidos
      await loadOrders();
    } catch (error) {
      console.error("Error al actualizar estado:", error);

      // Mostrar alerta de error
      customAlertGeneral(
        "Error al actualizar el estado del pedido",
        "Error",
        "error"
      );
    }
  }

  await updateOrderStatus(pedidoId, nuevoEstado);
};

// Eventos de filtros
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    (e.target as HTMLElement).classList.add("active");
    currentFilter = (e.target as HTMLElement).dataset.status || "TODOS";
    loadOrders();
  });
});

loadOrders();
