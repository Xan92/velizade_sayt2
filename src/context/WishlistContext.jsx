import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [likes, setLikes] = useState(() => {
    const saved = localStorage.getItem('velizade_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('velizade_wishlist', JSON.stringify(likes));
  }, [likes]);

  const toggle = (id) => {
    setLikes(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const isLiked = (id) => likes.includes(id);

  return (
    <WishlistContext.Provider value={{ likes, toggle, isLiked }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
