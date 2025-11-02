import { logout, getUser, requireAuth } from '../../../utils/auth';
import { getCart, setCart, removeFromCart, updateCartItemQty, clearCart, getCartTotal } from '../../../utils/cart-utils';

requireAuth();

const qs = <T extends Element>(s: string) => document.querySelector(s) as T;

// Configurar logout
document.getElementById('logout-btn')?.addEventListener('click', () => logout());

// Mostrar nombre del usuario
const user = getUser();
if (user) {
  qs<HTMLElement>('.user').textContent = `${user.nombre} ${user.apellido}`;
}

function renderCart() {
  const cart = getCart();
  const cartItemsDiv = document.getElementById('cartItems');
  const emptyCartDiv = document.getElementById('emptyCart');
  const cartContent = document.querySelector('.cart-content') as HTMLElement;

  if (cart.length === 0) {
    if (emptyCartDiv) emptyCartDiv.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (emptyCartDiv) emptyCartDiv.style.display = 'none';
  if (cartContent) cartContent.style.display = 'grid';

  if (!cartItemsDiv) return;

  cartItemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.productId}">
      ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}" class="item-img">` : '<div class="item-img"></div>'}
      <div class="item-details">
        <h3 class="item-name">${item.nombre}</h3>
        <p class="item-price">$${item.precio.toFixed(2)}</p>
        <div class="item-quantity">
          <button class="qty-btn" onclick="changeQty(${item.productId}, -1)">-</button>
          <input type="number" class="qty-input" value="${item.qty}" min="1" max="${item.stock}" 
                 onchange="updateQty(${item.productId}, this.value)" readonly>
          <button class="qty-btn" onclick="changeQty(${item.productId}, 1)">+</button>
          <span style="margin-left: 1rem; color: #6b7280; font-size: 0.9rem;">
            Stock: ${item.stock}
          </span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-remove" onclick="removeItem(${item.productId})">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `).join('');

  updateSummary();
}

function updateSummary() {
  const total = getCartTotal();
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');

  if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function changeQty(productId: number, delta: number) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);

  if (!item) return;

  const newQty = item.qty + delta;

  if (newQty < 1) {
    if (confirm('¿Eliminar este producto del carrito?')) {
      removeFromCart(productId);
      renderCart();
    }
    return;
  }

  if (newQty > item.stock) {
    alert(`No hay suficiente stock. Máximo: ${item.stock}`);
    return;
  }

  updateCartItemQty(productId, newQty);
  renderCart();
}

function updateQty(productId: number, value: string) {
  const qty = parseInt(value);
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);

  if (!item) return;

  if (qty < 1 || isNaN(qty)) {
    renderCart();
    return;
  }

  if (qty > item.stock) {
    alert(`No hay suficiente stock. Máximo: ${item.stock}`);
    renderCart();
    return;
  }

  updateCartItemQty(productId, qty);
  renderCart();
}

function removeItem(productId: number) {
  if (confirm('¿Eliminar este producto del carrito?')) {
    removeFromCart(productId);
    renderCart();
  }
}

// Checkout
document.getElementById('btnCheckout')?.addEventListener('click', () => {
  const cart = getCart();
  
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  // Aquí se integraría con el backend para crear el pedido
  const total = getCartTotal();
  
  if (confirm(`¿Confirmar pedido por $${total.toFixed(2)}?`)) {
    // TODO: Enviar pedido al backend
    alert('¡Pedido realizado con éxito!');
    clearCart();
    renderCart();
    window.location.href = '/src/pages/client/orders/orders.html';
  }
});

// Hacer funciones disponibles globalmente
(window as any).changeQty = changeQty;
(window as any).updateQty = updateQty;
(window as any).removeItem = removeItem;

// Renderizar carrito al cargar
renderCart();