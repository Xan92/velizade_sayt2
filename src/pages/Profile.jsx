import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { formatPrice, isValidAzPhone } from '../config/format';
import { Package, LogOut, ShieldCheck } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

function Profile() {
  const { user, profile, isAdmin, logout, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  usePageMeta('Profil');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
    // Profil sətri olmayan istifadəçi də sifarişlərini görməlidir
    if (user) fetchUserOrders();
  }, [user, profile, authLoading]);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (formData.phone.trim() && !isValidAzPhone(formData.phone)) {
      alert('Nömrə düzgün qeyd edilməyib. Nömrə 050, 051, 010, 055, 099, 070 və ya 077 ilə başlamalıdır.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(formData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      alert('Xəta: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-rose)' }}>Yüklənir...</div>;

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>

        {/* Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--clr-rose-lt)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Şəxsi Kabinet</span>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'var(--clr-white)', marginTop: '4px' }}>
              Xoş gəldiniz, {profile?.full_name || user?.email}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                <ShieldCheck size={18} /> Admin Panel
              </button>
            )}
            <button onClick={logout} className="btn-ghost" style={{ padding: '10px 20px', fontSize: '13.5px', borderColor: 'var(--color-error)', color: '#ff7373' }}>
              <LogOut size={16} /> Çıxış
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '32px', alignItems: 'start' }}>

          {/* Profile Form */}
          <div style={{ backgroundColor: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--clr-white)', marginBottom: '20px' }}>
              Profil Məlumatlarınız
            </h2>

            {savedMsg && (
              <div style={{ backgroundColor: 'rgba(107,117,84,0.3)', border: '1px solid var(--clr-green)', color: 'var(--clr-rose)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
                Məlumatlar uğurla yadda saxlanıldı!
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>Email</label>
                <input disabled value={user?.email || ''} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--clr-border)', backgroundColor: '#1c2217', color: 'var(--clr-muted)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>Ad və Soyad</label>
                <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>Telefon Nömrəsi</label>
                <input type="tel" placeholder="050 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '6px' }}>Standart Çatdırılma Ünvanı</label>
                <textarea rows="3" placeholder="Küçə, bina, mənzil..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none', resize: 'none' }} />
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                {saving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
              </button>
            </form>
          </div>

          {/* Orders History */}
          <div style={{ backgroundColor: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--clr-white)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--clr-rose)" /> Sifariş Tarixçəniz ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <p style={{ color: 'var(--clr-muted)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
                Hələ ki, heç bir sifarişiniz yoxdur.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ backgroundColor: 'var(--clr-surface2)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--clr-white)' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span style={{
                        fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600',
                        backgroundColor: order.status === 'completed' ? 'rgba(107,117,84,0.3)' : 'rgba(212,191,126,0.2)',
                        color: order.status === 'completed' ? 'var(--clr-green-lt)' : 'var(--clr-rose)'
                      }}>
                        {order.status === 'completed' ? 'Təhvil verildi' : order.status === 'pending' ? 'Gözləmədə' : order.status === 'rejected' ? 'İmtina edilib' : order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '8px' }}>
                      {new Date(order.created_at).toLocaleDateString('az-AZ')} • {formatPrice(order.total_amount)} AZN
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '12px', color: 'var(--clr-text)', backgroundColor: '#283220', padding: '4px 8px', borderRadius: '6px' }}>
                          {item.quantity}x {typeof item.name === 'object' ? item.name.az : item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;