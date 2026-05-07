import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  options: Record<string, string>;
  quantity: number;
  fileName?: string;
  unitPrice: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('open4printing-cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('open4printing-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...item, id }]);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const itemCount = items.length;

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount };
}
