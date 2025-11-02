import { GET } from '../../../utils/api';
import { logout, getUser, requireAuth } from '../../../utils/auth';
import { addToCart, getCartCount } from '../../../utils/cart-utils';

requireAuth();

const qs = <T extends Element>(s: string) => document.querySelector(s) as T;

// Configurar logout
document.getElementById('logout-btn')?.addEventListener('click', () => logout());

// Mostrar nombre del usuario y actualizar carrito
const user = getUser();
if (user) {
  qs<HTMLElement>('.user').textContent = `${user.nombre} ${user.apellido}`;
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = String(getCartCount());
  }
}

// Mensaje de bienvenida
if (user) {
  qs<HTMLElement>('#welcomeMsg').textContent = 
    `Hola ${user.nombre}! Explora nuestros productos`;
}

function norm<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res?.content) return res.content;
  if (res?.data) return res.data;
  return [];
}

function renderProductCard(p: any): string {
  const stockClass = p.stock < 10 ? 'low' : '';
  const isAvailable = p.stock > 0 && p.disponible !== false;
  
  return `
    <div class="product-card" onclick="goToProduct(${p.id})">
      ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="product-img">` : '<div class="product-img"></div>'}
      <h3 class="product-name">${p.nombre}</h3>
      <p class="product-desc">${p.descripcion || 'Sin descripción'}</p>
      <div class="product-footer">
        <span class="product-price">$${p.precio}</span>
        <span class="product-stock ${stockClass}">
          ${p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock'}
        </span>
      </div>
      <div class="product-actions">
        <button 
          class="btn-add-cart" 
          ${!isAvailable ? 'disabled' : ''}
          onclick="event.stopPropagation(); addProductToCart(${p.id}, '${p.nombre.replace(/'/g, "\\'")}', ${p.precio}, '${p.imagen || ''}', ${p.stock})"
        >
          ${isAvailable ? '🛒 Agregar al carrito' : 'No disponible'}
        </button>
      </div>
    </div>
  `;
}

function toggleCategory(categoryId: number) {
  const container = document.querySelector(`#products-${categoryId}`) as HTMLElement;
  const arrow = document.querySelector(`#arrow-${categoryId}`) as HTMLElement;
  
  if (container && arrow) {
    container.classList.toggle('open');
    arrow.classList.toggle('open');
  }
}

async function load() {
  try {
    const cats = norm(await GET('/categorias'));
    const prods = norm(await GET('/productos'));

    // Filtrar solo productos disponibles
    const availableProds = prods.filter((p: any) => p.disponible !== false);

    if (cats.length === 0) {
      qs('#emptyState').style.display = 'block';
      return;
    }

    const container = qs<HTMLElement>('#categoriesContainer');
    
    container.innerHTML = cats.map((cat: any) => {
      // Filtrar productos de esta categoría
      const categoryProducts = availableProds.filter((p: any) => 
        p.categoriaId === cat.id || p.categoria?.id === cat.id
      );

      return `
        <div class="category-card">
          <div class="category-header" onclick="toggleCategory(${cat.id})">
            ${cat.imagen ? `<img src="${cat.imagen}" alt="${cat.nombre}" class="category-img">` : '<div class="category-img"></div>'}
            <div class="category-info">
              <h2 class="category-name">${cat.nombre}</h2>
              <p class="category-desc">${cat.descripcion || ''}</p>
            </div>
            <span class="category-arrow" id="arrow-${cat.id}">▼</span>
          </div>
          <div class="products-container" id="products-${cat.id}">
            ${categoryProducts.length > 0 
              ? `<div class="products-grid">${categoryProducts.map(renderProductCard).join('')}</div>`
              : '<div class="no-products">No hay productos en esta categoría</div>'
            }
          </div>
        </div>
      `;
    }).join('');

    // Hacer disponibles las funciones globalmente
    (window as any).toggleCategory = toggleCategory;
    (window as any).addProductToCart = addProductToCart;
    (window as any).goToProduct = goToProduct;

  } catch (e) {
    console.error('Error:', e);
    alert('Error al cargar datos. Verifica que el backend esté corriendo.');
  }
}

function addProductToCart(id: number, nombre: string, precio: number, imagen: string, stock: number) {
  addToCart({
    productId: id,
    nombre,
    precio,
    qty: 1,
    imagen,
    stock
  });
  
  updateCartBadge();
  alert(`${nombre} agregado al carrito`);
}

function goToProduct(id: number) {
  window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${id}`;
}

load();