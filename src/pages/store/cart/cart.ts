import { logout, requireAuth, getUser } from '@/utils/auth';
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '@/utils/cart';
import { POST, GET } from '@/utils/api';
import type { CreatePedidoDTO } from '@/types/IOrders';

requireAuth();

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

async function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartContent')!;

  console.log('Carrito actual:', cart);

  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos desde la tienda para empezar a comprar</p>
        <button class="btn-checkout" onclick="window.location.href='/src/pages/store/home/home.html'">
          Ir a la tienda
        </button>
      </div>
    `;
    return;
  }

  const total = getCartTotal();

  const cartItemsHTML = cart.map(item => {
    const itemTotal = item.precio * item.qty;
    return `
      <div class="cart-item" data-id="${item.productId}">
        ${item.imagen 
          ? `<img src="${item.imagen}" alt="${item.nombre}" class="item-img">`
          : `<div class="item-img" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:2rem;">🍔</div>`
        }
        <div class="item-info">
          <h3>${item.nombre}</h3>
          <div class="item-price">$${item.precio.toFixed(2)} c/u</div>
        </div>
        <div class="item-qty">
          <button class="qty-btn" data-action="decrease" data-id="${item.productId}">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.productId}">+</button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;">
          <div class="item-total">$${itemTotal.toFixed(2)}</div>
          <button class="btn-remove" data-id="${item.productId}">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cart-content">
      <div class="cart-items">
        ${cartItemsHTML}
      </div>

      <div class="cart-summary">
        <h2 style="margin-top:0;color:#2d3436;">Resumen del Pedido</h2>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span style="font-weight:600;">$${total.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Envío:</span>
          <span style="font-weight:600;color:#00b894;">Gratis</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>

        <div class="cart-actions">
          <button class="btn-checkout" id="btnCheckout">
            Realizar Pedido
          </button>
          <button class="btn-continue" onclick="window.location.href='/src/pages/store/home/home.html'">
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents() {
  // Botones de cantidad
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLButtonElement;
      const action = target.dataset.action;
      const productId = Number(target.dataset.id);
      const cart = getCart();
      const item = cart.find(i => i.productId === productId);

      if (!item) return;

      if (action === 'increase') {
        try {
          // Validar stock disponible
          const productInDb: any = await GET(`/productos/${productId}`);
          
          if (item.qty >= productInDb.stock) {
            alert(`Stock máximo alcanzado para ${item.nombre}. Disponible: ${productInDb.stock}`);
            return;
          }
          
          updateQuantity(productId, item.qty + 1);
          renderCart();
        } catch (error) {
          console.error('Error al validar stock:', error);
          alert('Error al verificar stock disponible');
        }
      } else if (action === 'decrease') {
        if (item.qty > 1) {
          updateQuantity(productId, item.qty - 1);
          renderCart();
        } else {
          if (confirm('¿Eliminar este producto del carrito?')) {
            removeFromCart(productId);
            renderCart();
          }
        }
      }
    });
  });

  // Botones de eliminar
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const productId = Number((e.target as HTMLButtonElement).dataset.id);
      if (confirm('¿Eliminar este producto del carrito?')) {
        removeFromCart(productId);
        renderCart();
      }
    });
  });

  // Botón de finalizar compra
  document.getElementById('btnCheckout')?.addEventListener('click', async () => {
    const cart = getCart();
    const total = getCartTotal();
    const currentUser = getUser();

    console.log('=== INICIANDO CHECKOUT ===');
    console.log('Usuario actual:', currentUser);
    console.log('Carrito:', cart);
    console.log('Total:', total);

    if (!currentUser) {
      alert('Debes iniciar sesión para realizar un pedido');
      window.location.href = '/src/pages/auth/login/login.html';
      return;
    }

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Validar stock antes de crear el pedido
    try {
      for (const item of cart) {
        const productInDb: any = await GET(`/productos/${item.productId}`);
        if (productInDb.stock < item.qty) {
          alert(`Stock insuficiente para ${item.nombre}. Disponible: ${productInDb.stock}, en carrito: ${item.qty}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error al validar stock:', error);
      alert('Error al validar stock disponible');
      return;
    }

    if (confirm(`¿Confirmar pedido por $${total.toFixed(2)}?`)) {
      const button = document.getElementById('btnCheckout') as HTMLButtonElement;
      button.disabled = true;
      button.textContent = 'Procesando...';

      try {
        const pedidoDTO: CreatePedidoDTO = {
          usuarioId: currentUser.id,
          total: total,
          items: cart.map(item => ({
            productoId: item.productId,
            productoNombre: item.nombre,
            precio: item.precio,
            cantidad: item.qty,
            subtotal: item.precio * item.qty
          }))
        };

        console.log('DTO a enviar:', pedidoDTO);

        const response = await POST('/pedidos', pedidoDTO);
        
        console.log('Respuesta del servidor:', response);
        
        alert('¡Pedido realizado con éxito! Puedes ver tus pedidos en "Mis Pedidos"');
        clearCart();
        window.location.href = '/src/pages/client/orders/orders.html';
      } catch (error: any) {
        console.error('=== ERROR AL CREAR PEDIDO ===');
        console.error('Error completo:', error);
        
        button.disabled = false;
        button.textContent = 'Realizar Pedido';
        
        alert('Error al realizar el pedido: ' + (error.message || 'Intenta nuevamente'));
      }
    }
  });
}

renderCart();