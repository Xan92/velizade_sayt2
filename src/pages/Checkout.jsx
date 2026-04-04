import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, User, Phone, MapPin, Calendar, Clock, Edit3, CheckCircle, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { db, ref, set } from '../config/firebase';

const TELEGRAM_TOKEN = '8755927473:AAFFcAXkzWDOHty6fWckMfG21ev3BiVjOMc';
const TELEGRAM_CHAT_ID = '1238464292';

// InputField defined OUTSIDE of Checkout to prevent re-creation on every render
// (fixes keyboard disappearing on mobile / typing freeze on desktop)
const InputField = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }}>
      <Icon size={18} aria-hidden="true" />
    </div>
    <input 
      required 
      style={{
        width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', 
        border: '1px solid var(--clr-border)', backgroundColor: '#283220', 
        outline: 'none', color: 'var(--clr-text)', fontSize: '14.5px', transition: 'var(--transition)'
      }} 
      onFocus={e => e.target.style.borderColor = 'var(--clr-green)'}
      onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
      {...props} 
    />
  </div>
);

function Checkout() {
  const { items, total, clearCart } = useCart();
  const { t, getLoc, lang } = useLocale();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', note: '', date: '', time: '12:00'
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [receiveType, setReceiveType] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const deliveryFee = 0; // Delivery is now free for all methods
  const finalTotal = total + deliveryFee;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const hours = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00' , '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

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
      text += `- ${item.qty}x ${getLoc(item.name)} (${item.price * item.qty} AZN)\n`;
    });
    text += `\n📦 Çatdırılma:  ${deliveryFee} AZN`;
    text += `\n💰 Yekun:  ${finalTotal} AZN`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
      });

      const orderId = Date.now().toString();
      const orderData = {
        id: orderId,
        customer: { ...formData, address: finalAddress },
        items: items.map(item => ({
             id: item.id, name: item.name, qty: item.qty, price: item.price, img: item.img
        })),
        deliveryMethod: finalMethod,
        receiveType: receiveType,
        deliveryFee,
        totalAmount: finalTotal,
        status: 'pending',
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
      <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ 
          backgroundColor: 'var(--clr-surface)', padding: '60px 40px', borderRadius: 'var(--radius-lg)', 
          textAlign: 'center', maxWidth: '500px', border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-card)' 
        }}>
          <CheckCircle size={80} color="var(--clr-green)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '500', fontFamily: 'var(--font-serif)', color: 'var(--clr-white)', marginBottom: '16px' }}>
            {t('chk_thanks')}, {formData.name.split(' ')[0]}!
          </h2>
          <p style={{ color: 'var(--clr-muted)', lineHeight: '1.7', marginBottom: '40px', fontSize: '15px' }}>{t('chk_success')}</p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ minWidth: '220px', justifyContent: 'center' }}>
            {t('chk_back')}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={64} style={{ marginBottom: '24px', opacity: 0.3 }} />
        <h2 style={{ fontSize: '24px', fontWeight: '500', fontFamily: 'var(--font-serif)', color: 'var(--clr-white)' }}>{t('chk_empty')}</h2>
        <button onClick={() => navigate('/shop')} className="btn-ghost" style={{ marginTop: '24px' }}>{t('go_shop')}</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
      {/* Breadcrumb Strip */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>{t('home')}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--clr-white)', fontWeight: '500' }}>{t('checkout')}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 100px', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', fontFamily: 'var(--font-serif)', color: 'var(--clr-white)', marginBottom: '40px', letterSpacing: '0.05em' }}>{t('checkout')}</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.3fr 1fr', gap: '60px', alignItems: 'start' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Customer Info */}
            <section>
              <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--clr-rose)', marginBottom: '24px' }}>{t('chk_info')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputField icon={User} name="name" value={formData.name} onChange={handleChange} placeholder={t('chk_name')} />
                <InputField icon={Phone} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('chk_phone')} />
                {receiveType === 'delivery' && (
                  <InputField icon={MapPin} name="address" value={formData.address} onChange={handleChange} placeholder={t('chk_address')} />
                )}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <InputField icon={Calendar} type="date" name="date" value={formData.date} onChange={handleChange} />
                  
                  {/* Time Slots Selector */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }}>
                      <Clock size={18} />
                    </div>
                    <select 
                      name="time" 
                      value={formData.time} 
                      onChange={handleChange}
                      style={{
                        width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', 
                        border: '1px solid var(--clr-border)', backgroundColor: '#283220', 
                        outline: 'none', color: 'var(--clr-text)', fontSize: '14.5px'
                      }}
                    >
                      {hours.map(h => <option key={h} value={h} style={{color: 'black'}}>{h}</option>)}
                    </select>
                  </div>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--clr-muted)' }}>
                    <Edit3 size={18} />
                  </div>
                  <textarea 
                    rows="4" 
                    name="note" 
                    value={formData.note} 
                    onChange={handleChange} 
                    placeholder={t('chk_note')}
                    style={{ 
                      width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--clr-border)', 
                      backgroundColor: '#283220', outline: 'none', color: 'var(--clr-text)', fontSize: '14.5px', resize: 'none' 
                    }} 
                  />
                </div>
              </div>
            </section>

            {/* Receive Type */}
            <section>
              <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--clr-rose)', marginBottom: '24px' }}>{t('chk_receive_type')}</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                  type="button"
                  onClick={() => setReceiveType('delivery')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '12px', 
                    background: receiveType === 'delivery' ? 'var(--clr-green)' : 'var(--clr-surface)', 
                    color: receiveType === 'delivery' ? 'var(--clr-rose)' : 'var(--clr-text)',
                    border: receiveType === 'delivery' ? '1px solid var(--clr-green)' : '1px solid var(--clr-border)',
                    fontWeight: '600', fontSize: '14px', transition: 'var(--transition)'
                  }}
                 >
                   <Truck size={18} style={{ display: 'block', margin: '0 auto 8px' }} />
                   {t('chk_delivery_type')}
                 </button>
                 <button 
                  type="button"
                  onClick={() => setReceiveType('pickup')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '12px', 
                    background: receiveType === 'pickup' ? 'var(--clr-green)' : 'var(--clr-surface)', 
                    color: receiveType === 'pickup' ? 'var(--clr-rose)' : 'var(--clr-text)',
                    border: receiveType === 'pickup' ? '1px solid var(--clr-green)' : '1px solid var(--clr-border)',
                    fontWeight: '600', fontSize: '14px', transition: 'var(--transition)'
                  }}
                 >
                   <MapPin size={18} style={{ display: 'block', margin: '0 auto 8px' }} />
                   {t('chk_pickup')}
                 </button>
              </div>
            </section>

            {/* Delivery Method removed */}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '60px', justifyContent: 'center', fontSize: '16px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '...' : t('chk_confirm')}
            </button>
          </form>

          {/* Sifariş Özəti Summary */}
          <aside style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '32px',
            position: 'sticky', top: '110px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--clr-rose)', marginBottom: '24px' }}>{t('chk_order')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--clr-border)' }}>
                     <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                   <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--clr-white)', marginBottom: '4px' }}>{getLoc(item.name)}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--clr-muted)' }}>
                        <span>{t('chk_qty')} {item.qty}</span>
                        <span style={{ color: 'var(--clr-rose-lt)', fontWeight: '600' }}>{item.price * item.qty} AZN</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', color: 'var(--clr-muted)' }}>
                  <span>{t('chk_products')}</span>
                  <span>{total} AZN</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', color: 'var(--clr-muted)' }}>
                  <span>{t('chk_delivery')}</span>
                  <span>{deliveryFee} AZN</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', color: 'var(--clr-rose-lt)', marginTop: '8px' }}>
                  <span>{t('total')}:</span>
                  <span>{finalTotal} AZN</span>
               </div>
            </div>
            
            {/* Payment notice removed */}
          </aside>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
