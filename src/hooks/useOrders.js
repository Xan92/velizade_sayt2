import { useState, useEffect } from 'react';
import { db, ref, get, child, update } from '../config/firebase';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snapshot = await get(child(ref(db), 'orders'));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersArray = Object.keys(data).map(key => ({
          ...data[key],
          firebaseId: key 
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Siyahıda ən yenilər üstdə
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Sifarişləri gətirərkən xəta: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update(ref(db, 'orders/' + orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.firebaseId === orderId || o.id === orderId ? { ...o, status: newStatus } : o));
      return true;
    } catch (err) {
      console.error("Status yenilənərkən xəta: ", err);
      return false;
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };
}
