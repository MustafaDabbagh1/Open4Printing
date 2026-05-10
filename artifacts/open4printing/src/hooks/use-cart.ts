import { useState, useEffect } from 'react';

export interface CartFile {
  id: number;
  name: string;
  size: number;
  type: string;
  side?: 'front' | 'back';
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  options: Record<string, string>;
  quantity: number;
  unitPrice: number;
  notes?: string;
  isBusinessCard?: boolean;
  files?: CartFile[];
  fileName?: string;
  uploadedFileId?: number;
}

const STORAGE_KEY = 'open4printing-cart';

function readStored(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it: CartItem): CartItem => {
      if (!it.files && it.uploadedFileId != null && it.fileName) {
        return {
          ...it,
          files: [{ id: it.uploadedFileId, name: it.fileName, size: 0, type: '' }],
        };
      }
      return it;
    });
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readStored());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
