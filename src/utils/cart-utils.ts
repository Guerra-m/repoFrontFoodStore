import type { ICartItem } from '@/types/ICart';

const KEY = 'cart';

export function getCart(): ICartItem[] {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function setCart(items: ICartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: ICartItem) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === item.productId);
  
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  
  setCart(cart);
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter(i => i.productId !== productId);
  setCart(cart);
}

export function updateCartItemQty(productId: number, qty: number) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  
  if (item) {
    item.qty = qty;
    setCart(cart);
  }
}

export function clearCart() {
  setCart([]);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + (item.precio * item.qty), 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
