import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('velizade_cart') || '[]');
      return Array.isArray(parsed) ? parsed.filter(i => i && Number.isFinite(i.price) && i.qty > 0) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('velizade_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (product.price == null) return; // qiyməti olmayan məhsul WhatsApp ilə sifariş olunur
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  // Səbəti bazadakı cari qiymət və məhsullarla uyğunlaşdırır, dəyişiklik olubsa true qaytarır
  const syncCart = (products) => {
    const next = items.flatMap(item => {
      const live = products.find(p => String(p.id) === String(item.id));
      return live && live.price != null ? [{ ...item, name: live.name, img: live.img, price: live.price }] : [];
    });
    const changed = next.length !== items.length || next.some((item, i) => item.price !== items[i].price);
    if (changed) setItems(next);
    return changed;
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, syncCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
