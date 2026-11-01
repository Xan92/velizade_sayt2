import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useOrders({ enabled = true } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sifarişlər yalnız admin təsdiqlənəndən sonra oxunur, yeni sifarişlər üçün dəqiqədə bir yenilənir
  useEffect(() => {
    if (!enabled) return;
    fetchOrders();
    const timer = setInterval(() => fetchOrders(true), 60000);
    return () => clearInterval(timer);
  }, [enabled]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mapped = (data || []).map(o => ({
        id: o.order_number || o.id,
        supabaseId: o.id,
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          address: o.customer_address,
          date: o.delivery_date,
          time: o.delivery_time,
          note: o.note,
        },
        items: (o.order_items || []).map(i => ({
          id: i.product_id,
          name: i.name,
          price: Number(i.price),
          qty: i.quantity,
          img: i.image_url,
        })),
        deliveryMethod: o.delivery_method,
        receiveType: o.receive_type,
        deliveryFee: Number(o.delivery_fee || 0),
        totalAmount: Number(o.total_amount),
        status: o.status,
        createdAt: o.created_at,
      }));
      setOrders(mapped);
    } catch (error) {
      console.error('Sifarişləri gətirərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.supabaseId === orderId ? { ...o, status: newStatus } : o));
      return true;
    } catch (err) { console.error('Status xəta:', err); return false; }
  };

  return { orders, loading, updateOrderStatus, refreshOrders: () => fetchOrders(true) };
}