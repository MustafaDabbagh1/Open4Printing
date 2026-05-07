import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('open4printing-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('open4printing-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return { favorites, toggleFavorite, isFavorite, count: favorites.length };
}
