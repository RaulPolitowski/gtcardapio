import { useState } from 'react';
import { CartItem, Product } from '../types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    product: Product, 
    additionals?: CartItem['additionals'], 
    notes?: string
  ) => {
    const existingItem = cart.find(
      item => 
        item.product.id === product.id && 
        item.notes === notes && 
        JSON.stringify(item.additionals) === JSON.stringify(additionals)
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, additionals, notes }]);
    }
  };

  const quickAdd = (product: Product) => {
    const existingItem = cart.find(
      item => item.product.id === product.id && !item.notes && (!item.additionals || item.additionals.length === 0)
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string, notes?: string, additionals?: CartItem['additionals']) => {
    setCart(cart.filter(item => 
      !(item.product.id === productId && 
        item.notes === notes && 
        JSON.stringify(item.additionals) === JSON.stringify(additionals))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, notes?: string, additionals?: CartItem['additionals']) => {
    if (quantity === 0) {
      removeFromCart(productId, notes, additionals);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId &&
      item.notes === notes &&
      JSON.stringify(item.additionals) === JSON.stringify(additionals)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const additionalsTotal = (item.additionals?.reduce(
        (sum, add) => sum + (add.price * add.quantity),
        0
      ) || 0) * item.quantity;
      return sum + itemTotal + additionalsTotal;
    }, 0);
  };

  return {
    cart,
    addToCart,
    quickAdd,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotal
  };
}