import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { db, ref, set } from '../config/firebase';

const TELEGRAM_TOKEN = '8755927473:AAFFcAXkzWDOHty6fWckMfG21ev3BiVjOMc';
const TELEGRAM_CHAT_ID = '1238464292';

function Checkout() {
  const { items, total, clearCart } = useCart();
  const { t, getLoc } = useLocale();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', note: '', date: '', time: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [receiveType, setReceiveType] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const deliveryFee = receiveType === 'pickup' ? 0 : (deliveryMethod === 'express' ? 15 : 8);
  const finalTotal = total + deliveryFee;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert(t('chk_empty'));

    setLoading(true);

    const finalAddress = receiveType === 'pickup' ? 'Filialdan Təhvil Alma (Özüm Götürürəm)' : formData.address;
    const finalMethod = receiveType === 'pickup' ? 'Özüm Götürürəm' : (deliveryMethod === 'express' ? 'Express' : 'Standard');

    let text = `📦 YENİ SİFARİŞ (WEB) — Velizade Flowers 🌸\n\n`;
    text += `👤 Ad:  ${formData.name}\n`;
    text += `📞 Tel:  ${formData.phone}\n`;
    text += `📍 Ünvan:  ${finalAddress}\n`;
    text += `📅 Çatdırılma:  ${formData.date} (${formData.time})\n`;
    text += `🚚 Metod:  ${finalMethod}\n`;
    if (formData.note) text += `💬 Qeyd:  ${formData.note}\n`;
    text += `\n🛍️ Sifariş:\n`;
    items.forEach(item => {
      text += `- ${item.qty}x ${item.name} (${item.price * item.qty} AZN)\n`;
    });
    text += `\n📦 Çatdırılma:  ${deliveryFee} AZN`;
    text += `\n💰 Yekun:  ${finalTotal} AZN`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text
        })
      });

      // Firebase-ə sifariş qeydi
      const orderId = Date.now().toString();
      const orderData = {
        id: orderId,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: finalAddress,
          date: formData.date,
          time: formData.time,
          note: formData.note
        },
        items: items.map(item => ({
             id: item.id,
             name: item.name,
             qty: item.qty,
             price: item.price,
             img: item.img
        })),
        deliveryMethod: finalMethod,
        receiveType: receiveType,
        deliveryFee,
        totalAmount: finalTotal,
        status: 'pending', // pending, completed, cancelled
        createdAt: new Date().toISOString()
      };
      await set(ref(db, 'orders/' + orderId), orderData);

      if (res.ok) {
        setSuccess(true);
        clearCart();
      } else {
        alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } catch (err) {
      alert('Sistem xətası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>✨</span>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '16px' }}>
            {t('chk_thanks')},<br />{formData.name}!
          </h2>
          <p style={{ color: 'var(--color-outline)', lineHeight: '1.6', marginBottom: '32px' }}>{t('chk_success')}</p>
          <button onClick={() => navigate('/')} style={{ padding: '16px 32px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>
            {t('chk_back')}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</span>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>{t('chk_empty')}</h2>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)',
    backgroundColor: 'var(--color-surface-container-low)', outline: 'none', color: 'var(--color-on-surface)'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 100px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '32px' }}>{t('chk_title')}</h1>
      
      {/* Sürətli Baxış */}
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>{t('chk_order')}</h3>
      <div style={{ marginBottom: '32px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '16px', marginBottom: '12px' }}>
             <img src={item.img} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
            <div style={{ marginLeft: '16px', flex: 1 }}>
               <h4 style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getLoc(item.name)}</h4>
               <p style={{ fontSize: '14px', color: 'var(--color-outline)' }}>{t('chk_qty')} {item.qty}</p>
            </div>
            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{item.price * item.qty} AZN</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>{t('chk_info')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} placeholder={t('chk_name')} />
          <input required type="tel" style={inputStyle} name="phone" value={formData.phone} onChange={handleChange} placeholder={t('chk_phone')} />
          {receiveType === 'delivery' && (
            <input required style={inputStyle} name="address" value={formData.address} onChange={handleChange} placeholder={t('chk_address')} />
          )}
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <input required type="date" style={{...inputStyle, flex: 1}} name="date" value={formData.date} onChange={handleChange} />
            <input required type="time" style={{...inputStyle, flex: 1}} name="time" value={formData.time} onChange={handleChange} />
          </div>

          <textarea rows="4" style={{...inputStyle, resize: 'none'}} name="note" value={formData.note} onChange={handleChange} placeholder={t('chk_note')} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>{t('chk_receive_type')}</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
           <label style={{ flex: '1 1 calc(50% - 6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '16px', border: receiveType === 'delivery' ? '2px solid var(--color-primary)' : '2px solid transparent', backgroundColor: receiveType === 'delivery' ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: receiveType === 'delivery' ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
              <input type="radio" name="rType" value="delivery" checked={receiveType === 'delivery'} onChange={()=>setReceiveType('delivery')} style={{ display: 'none' }} />
              {t('chk_delivery_type')}
           </label>
           <label style={{ flex: '1 1 calc(50% - 6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '16px', border: receiveType === 'pickup' ? '2px solid var(--color-primary)' : '2px solid transparent', backgroundColor: receiveType === 'pickup' ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: receiveType === 'pickup' ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
              <input type="radio" name="rType" value="pickup" checked={receiveType === 'pickup'} onChange={()=>setReceiveType('pickup')} style={{ display: 'none' }} />
              {t('chk_pickup')}
           </label>
        </div>

        {receiveType === 'pickup' ? (
           <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '16px', marginBottom: '40px', color: 'var(--color-on-surface-variant)', fontSize: '14px', lineHeight: '1.6' }}>
             ℹ️ {t('chk_pickup_info')}
           </div>
        ) : (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>{t('chk_method')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
               <label style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '16px', border: deliveryMethod === 'standard' ? '2px solid var(--color-primary-fixed)' : '2px solid transparent', backgroundColor: deliveryMethod === 'standard' ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)', cursor: 'pointer' }}>
                  <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} style={{ marginRight: '16px', accentColor: 'var(--color-primary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}>{t('chk_std')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>2-4h</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>8 AZN</div>
               </label>

           <label style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '16px', border: deliveryMethod === 'express' ? '2px solid var(--color-primary-fixed)' : '2px solid transparent', backgroundColor: deliveryMethod === 'express' ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)', cursor: 'pointer' }}>
              <input type="radio" name="delivery" value="express" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} style={{ marginRight: '16px', accentColor: 'var(--color-primary)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}>{t('chk_exp')}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>45m</div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>15 AZN</div>
           </label>
            </div>
          </>
        )}

        {/* Cəm */}
        <div style={{ borderTop: '1px solid var(--color-surface-container-highest)', paddingTop: '24px', marginBottom: '40px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--color-outline)' }}>{t('chk_products')}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}>{total} AZN</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--color-outline)' }}>{t('chk_delivery')}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}>{deliveryFee} AZN</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{t('chk_total')}:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>{finalTotal} AZN</span>
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '18px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '...' : t('chk_confirm')}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
