import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [likes, setLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('velizade_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Köhnə saxta rəqəmləri (1, 2, 3) təmizləyir, yalnız həqiqi Supabase UUID-lərini saxlayır
      return Array.isArray(parsed) 
        ? parsed.filter(id => typeof id === 'string' && id.includes('-')) 
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('velizade_wishlist', JSON.stringify(likes));
  }, [likes]);

  const toggle = (id) => {
    const strId = String(id);
    setLikes(prev => 
      prev.some(l => String(l) === strId)
        ? prev.filter(l => String(l) !== strId)
        : [...prev, strId]
    );
  };

  const isLiked = (id) => likes.some(l => String(l) === String(id));

  const clearLikes = () => setLikes([]);

  return (
    <WishlistContext.Provider value={{ likes, setLikes, toggle, isLiked, clearLikes }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);