import { GET } from '@/utils/api';
import { logout, getUser } from '@/utils/auth';
import { addToCart, getCart, updateQuantity } from '@/utils/cart';
import type { IProduct } from '@/types/IProduct';
import type { ICategoria } from '@/types/ICategoria';

const user = getUser();
if (user) {
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById('logout-btn')?.addEventListener('click', () => logout());

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

let allProducts: IProduct[] = [];

async function loadCategoriesAndProducts() {
  try {
    const [categoriasRes, productosRes]: [any, any] = await Promise.all([
      GET('/categorias'),
      GET('/productos')
    ]);

    const categorias = norm<ICategoria>(categoriasRes);
    allProducts = norm<IProduct>(productosRes);

    renderCategories(categorias);
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

function renderCategories(categorias: ICategoria[]) {
  const container = document.getElementById('categoriesContainer')!;

  container.innerHTML = categorias.map(categoria => {
    const productosCategoria = allProducts.filter(p => p.categoriaId === categoria.id && p.disponible);

    if (productosCategoria.length === 0) {
      return '';
    }

    return `
      <div class="category-section">
        <div class="category-header" data-category-id="${categoria.id}">
          <h2>${categoria.nombre}</h2>
          <span class="category-toggle">▼</span>
        </div>
        <div class="products-grid" id="products-${categoria.id}">
          ${renderProducts(productosCategoria)}
        </div>
      </div>
    `;
  }).join('');

  // Toggle de categorías
  document.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const categoryId = (e.currentTarget as HTMLElement).dataset.categoryId;
      const productsGrid = document.getElementById(`products-${categoryId}`);
      const toggle = (e.currentTarget as HTMLElement).querySelector('.category-toggle');

      productsGrid?.classList.toggle('active');
      toggle?.classList.toggle('active');
    });
  });

  // Click en productos para abrir modal
  attachProductClickListeners();
}

function renderProducts(productos: IProduct[]): string {
  if (productos.length === 0) {
    return '<div class="empty-category">No hay productos disponibles en esta categoría</div>';
  }

  return productos.map(product => {
    const cart = getCart();
    const inCart = cart.find(item => item.productId === product.id);
    const cartQty = inCart ? inCart.qty : 0;
    
    let stockClass = '';
    let stockText = '';
    
    if (product.stock === 0) {
      stockClass = 'out-of-stock';
      stockText = '❌ Sin stock';
    } else if (product.stock <= 5) {
      stockClass = 'low-stock';
      stockText = `⚠️ Quedan ${product.stock}`;
    } else {
      stockClass = 'in-stock';
      stockText = `✅ Stock: ${product.stock}`;
    }
    
    return `
      <div class="product-card ${product.stock === 0 ? 'disabled' : ''}" data-product-id="${product.id}">
        ${product.imagen 
          ? `<img src="${product.imagen}" alt="${product.nombre}" class="product-img">`
          : `<div class="product-img" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:3rem;">🍔</div>`
        }
        <div class="product-info">
          <h3 class="product-name">${product.nombre}</h3>
          <div class="product-footer">
            <div>
              <div class="product-price">$${product.precio.toFixed(2)}</div>
              <div class="product-stock ${stockClass}">${stockText}</div>
              ${cartQty > 0 ? `<div class="in-cart-badge">🛒 ${cartQty} en carrito</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function attachProductClickListeners() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if ((this as HTMLElement).classList.contains('disabled')) return;
      
      const productId = Number((this as HTMLElement).dataset.productId);
      const product = allProducts.find(p => p.id === productId);
      
      if (product) {
        openProductModal(product);
      }
    });
  });
}

function openProductModal(product: IProduct) {
  const cart = getCart();
  const inCart = cart.find(item => item.productId === product.id);
  const currentQtyInCart = inCart ? inCart.qty : 0;
  
  let modalQuantity = 1;
  const maxQuantity = product.stock - currentQtyInCart;

  const modalHTML = `
    <div class="product-modal-overlay" id="productModal">
      <div class="product-modal">
        <button class="modal-close" id="modalCloseBtn">✕</button>
        
        <div class="modal-content">
          <div class="modal-image">
            ${product.imagen 
              ? `<img src="${product.imagen}" alt="${product.nombre}">`
              : `<div style="background:#f0f0f0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;border-radius:12px;">🍔</div>`
            }
          </div>
          
          <div class="modal-info">
            <h2>${product.nombre}</h2>
            <p class="modal-description">${product.descripcion || 'Sin descripción disponible'}</p>
            
            <div class="modal-stock-info">
              <span class="modal-price">$${product.precio.toFixed(2)}</span>
              <span class="modal-stock">Stock total: ${product.stock} | Disponible para agregar: ${maxQuantity}</span>
              ${currentQtyInCart > 0 ? `<span class="modal-in-cart">Ya tienes ${currentQtyInCart} en el carrito</span>` : ''}
            </div>

            ${maxQuantity > 0 ? `
              <div class="modal-quantity">
                <label>Cantidad a agregar:</label>
                <div class="quantity-controls">
                  <button class="qty-btn" id="decreaseQty">-</button>
                  <input type="number" id="modalQtyInput" value="1" min="1" max="${maxQuantity}" readonly>
                  <button class="qty-btn" id="increaseQty">+</button>
                </div>
              </div>

              <div class="modal-total">
                <span>Total:</span>
                <span id="modalTotal" class="modal-total-price">$${product.precio.toFixed(2)}</span>
              </div>

              <div class="modal-actions">
                <button class="btn-add-to-cart" id="addToCartBtn">
                  Agregar al carrito
                </button>
              </div>
            ` : `
              <div class="modal-actions">
                <div style="text-align:center;padding:1rem;color:#d63031;font-weight:600;">
                  ❌ No hay stock disponible para agregar más de este producto
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Botón cerrar modal
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeProductModal();
    });
  }

  if (maxQuantity > 0) {
    // Event listeners del modal
    const qtyInput = document.getElementById('modalQtyInput') as HTMLInputElement;
    const totalDisplay = document.getElementById('modalTotal')!;
    const decreaseBtn = document.getElementById('decreaseQty')!;
    const increaseBtn = document.getElementById('increaseQty')!;
    const addToCartBtn = document.getElementById('addToCartBtn')!;

    function updateTotal() {
      const total = product.precio * modalQuantity;
      totalDisplay.textContent = `$${total.toFixed(2)}`;
      qtyInput.value = String(modalQuantity);
    }

    decreaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalQuantity > 1) {
        modalQuantity--;
        updateTotal();
      }
    });

    increaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalQuantity < maxQuantity) {
        modalQuantity++;
        updateTotal();
      } else {
        alert(`Stock máximo disponible para agregar: ${maxQuantity}`);
      }
    });

    addToCartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Agregar o actualizar cantidad en el carrito
      if (inCart) {
        updateQuantity(product.id, inCart.qty + modalQuantity);
      } else {
        addToCart({
          productId: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          qty: modalQuantity
        });
      }

      updateCartBadge();
      closeProductModal();
      
      // Actualizar SOLO los badges, no re-renderizar todo
      updateAllProductBadges();

      // Mostrar feedback
      const message = document.createElement('div');
      message.className = 'toast-message';
      message.textContent = `✅ ${modalQuantity} ${product.nombre} agregado(s) al carrito`;
      message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #00b894;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(message);
      
      setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
      }, 2000);
    });
  }

  // Cerrar modal al hacer click en el overlay
  document.getElementById('productModal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('product-modal-overlay')) {
      closeProductModal();
    }
  });
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.remove();
  }
}

function updateAllProductBadges() {
  const cart = getCart();
  
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = Number((card as HTMLElement).dataset.productId);
    const inCart = cart.find(item => item.productId === productId);
    const cartQty = inCart ? inCart.qty : 0;
    
    const footer = card.querySelector('.product-footer > div');
    if (footer) {
      const existingBadge = footer.querySelector('.in-cart-badge');
      if (existingBadge) {
        existingBadge.remove();
      }
      
      if (cartQty > 0) {
        const badge = document.createElement('div');
        badge.className = 'in-cart-badge';
        badge.textContent = `🛒 ${cartQty} en carrito`;
        footer.appendChild(badge);
      }
    }
  });
}

// Estilos para el toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

updateCartBadge();
loadCategoriesAndProducts();