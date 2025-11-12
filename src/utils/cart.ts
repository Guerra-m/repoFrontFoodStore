export interface ICartItem {
  productId: number;
  nombre: string;
  precio: number;
  imagen: string;
  qty: number;
}

const CART_KEY = 'cart';

export function getCart(): ICartItem[] {
  try {
    const cartStr = localStorage.getItem(CART_KEY);
    if (!cartStr) return [];
    const cart = JSON.parse(cartStr);
    console.log('Carrito obtenido de localStorage:', cart);
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return [];
  }
}

export function saveCart(cart: ICartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('Carrito guardado:', cart);
  } catch (error) {
    console.error('Error al guardar carrito:', error);
  }
}

export function addToCart(item: ICartItem): void {
  const cart = getCart();
  const existingItem = cart.find(i => i.productId === item.productId);

  if (existingItem) {
    existingItem.qty += item.qty;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function updateQuantity(productId: number, qty: number): void {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);

  if (item) {
    item.qty = qty;
    saveCart(cart);
  }
}

export function removeFromCart(productId: number): void {
  let cart = getCart();
  cart = cart.filter(i => i.productId !== productId);
  saveCart(cart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.precio * item.qty), 0);
}