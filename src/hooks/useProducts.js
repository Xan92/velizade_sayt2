import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { localCatalog, legacyCategoryByImage } from '../data/catalog';

const legacyCategory = (url = '') => {
  const key = Object.keys(legacyCategoryByImage).find(k => url.includes(k));
  return key ? legacyCategoryByImage[key] : null;
};

const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  desc: p.description,
  price: p.price == null ? null : Number(p.price),
  oldPrice: p.old_price ? Number(p.old_price) : null,
  category: p.category_id || legacyCategory(p.image_url || ''),
  color: p.color,
  img: p.image_url,
  badge: p.badge,
  badgeType: p.badge_type,
  featured: p.featured,
  active: p.active,
  order: p.sort_order,
});

const unmapProduct = (p) => {
  const m = {};
  if (p.name !== undefined) m.name = p.name;
  if (p.desc !== undefined) m.description = p.desc;
  if (p.price !== undefined) m.price = p.price;
  if (p.oldPrice !== undefined) m.old_price = p.oldPrice;
  if (p.category !== undefined) m.category_id = p.category;
  if (p.color !== undefined) m.color = p.color;
  if (p.img !== undefined) m.image_url = p.img;
  if (p.badge !== undefined) m.badge = p.badge;
  if (p.badgeType !== undefined) m.badge_type = p.badgeType;
  if (p.featured !== undefined) m.featured = p.featured;
  if (p.active !== undefined) m.active = p.active;
  if (p.order !== undefined) m.sort_order = p.order;
  return m;
};

export function useProducts({ showInactive = false } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*').order('sort_order', { ascending: true });
      if (!showInactive) query = query.eq('active', true);
      const { data, error } = await query;
      if (error) throw error;
      const fromDb = (data || []).map(mapProduct);
      setLoadFailed(false);
      if (showInactive) {
        setProducts(fromDb);
      } else {
        // Bazaya hələ köçürülməmiş kataloq şəkilləri öndə göstərilir
        const dbImages = new Set(fromDb.map(p => p.img));
        setProducts([...localCatalog.filter(p => !dbImages.has(p.img)), ...fromDb]);
      }
    } catch (error) {
      console.error('Məhsulları gətirərkən xəta:', error);
      setLoadFailed(true);
      if (!showInactive) setProducts(localCatalog);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      const { data, error } = await supabase.from('products').insert([unmapProduct(newProduct)]).select().single();
      if (error) throw error;
      setProducts(prev => [...prev, mapProduct(data)].sort((a, b) => a.order - b.order));
      return true;
    } catch (err) { console.error('Əlavə xəta:', err); return false; }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (err) { console.error('Silmə xəta:', err); return false; }
  };

  const editProduct = async (productId, updatedData) => {
    try {
      const dbData = unmapProduct(updatedData);
      dbData.updated_at = new Date().toISOString();
      const { error } = await supabase.from('products').update(dbData).eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedData } : p));
      return true;
    } catch (err) { console.error('Yeniləmə xəta:', err); return false; }
  };

  const updateProductStatus = async (productId, currentFeatured) => {
    try {
      const { error } = await supabase.from('products').update({ featured: !currentFeatured }).eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, featured: !currentFeatured } : p));
      return true;
    } catch (err) { console.error('Status xəta:', err); return false; }
  };

  const updateProductOrder = async (reorderedArray) => {
    try {
      const updates = reorderedArray.map((p, idx) =>
        supabase.from('products').update({ sort_order: idx + 1 }).eq('id', p.id)
      );
      await Promise.all(updates);
      setProducts(reorderedArray.map((p, idx) => ({ ...p, order: idx + 1 })));
      return true;
    } catch (err) { console.error('Sıralama xəta:', err); return false; }
  };

  return { products, loading, loadFailed, addProduct, deleteProduct, editProduct, updateProductStatus, updateProductOrder, refreshProducts: fetchProducts };
}