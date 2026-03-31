import { useState, useEffect } from 'react';
import { db, ref, get, set, child, remove, update } from '../config/firebase';
import { allProducts as defaultSeedData } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verilənlər bazasından canlı yükləmə
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'products'));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Obyekt formatındakı məlumatları massivə (array) çeviririk və Sırasi ilə (Order) düzürük
        const productsArray = Object.keys(data).map(key => ({
          ...data[key],
          firebaseId: key 
        })).sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : a.id;
          const orderB = b.order !== undefined ? b.order : b.id;
          return orderA - orderB;
        });
        setProducts(productsArray);
      } else {
        // İLK DƏFƏ: Əgər baza tamamilə boşdursa, köhnə static datanı bazaya yüklə!
        console.log("Baza boşdur, mövcud qovluqdakı məhsullar Firebase-ə əkilir (Seed)...");
        await seedDatabase();
      }
    } catch (error) {
      console.error("Məhsulları gətirərkən xəta: ", error);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      const updates = {};
      // defaultSeedData (products.js) içindəki məhsulları `products/{id}` altına göndəririk
      defaultSeedData.forEach(prod => {
        updates['products/' + prod.id] = prod;
      });
      await update(ref(db), updates);
      setProducts(defaultSeedData);
    } catch (err) {
      console.error("Baza toxumlanarkən xəta:", err);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      // Yeni təsadüfi ID və firebase strukturu
      const id = Date.now();
      const productObj = { ...newProduct, id, order: id }; // Set initial order
      await set(ref(db, 'products/' + id), productObj);
      
      // Lokal olaraq ekranı dərhal yenilə
      setProducts(prev => [...prev, productObj].sort((a,b)=>a.order-b.order));
      return true;
    } catch (err) {
      console.error("Əlavə edilərkən xəta", err);
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await remove(ref(db, 'products/' + productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (err) {
      console.error("Silinərkən xəta: ", err);
      return false;
    }
  };

  const editProduct = async (productId, updatedData) => {
    try {
      await update(ref(db, 'products/' + productId), updatedData);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedData } : p));
      return true;
    } catch (err) {
      console.error("Məhsul güncəllənərkən xəta: ", err);
      return false;
    }
  };

  const updateProductStatus = async (productId, currentFeatured) => {
    try {
      await update(ref(db, 'products/' + productId), {
        featured: !currentFeatured
      });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, featured: !currentFeatured } : p));
      return true;
    } catch (err) {
      console.error("Status yenilənərkən xəta: ", err);
      return false;
    }
  };

  const updateProductOrder = async (reorderedArray) => {
    try {
      const updates = {};
      reorderedArray.forEach((p, idx) => {
        updates['products/' + p.id + '/order'] = idx + 1;
      });
      await update(ref(db), updates);
      
      // Ekrani dərhal yeni və təmiz sıralamayla yeniləyirik
      const mapped = reorderedArray.map((p, idx) => ({ ...p, order: idx + 1 }));
      setProducts(mapped); 
      return true;
    } catch (err) {
      console.error("Sıralama yenilənərkən xəta: ", err);
      return false;
    }
  };

  return {
    products,
    loading,
    addProduct,
    deleteProduct,
    editProduct,
    updateProductStatus,
    updateProductOrder,
    refreshProducts: fetchProducts
  };
}
