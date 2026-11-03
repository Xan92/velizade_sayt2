import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { supabase } from '../config/supabase';
import { siteConfig } from '../config/siteConfig';
import { getThumbUrl } from '../config/imageUtils';
import { formatPrice, whatsappLink, isValidAzPhone } from '../config/format';
import { usePageMeta } from '../hooks/usePageMeta';
import { useProducts } from '../hooks/useProducts';
import { ShoppingBag, Truck, User, Phone, MapPin, Calendar, Clock, Edit3, CheckCircle, ChevronRight, Trash2, Plus, Minus, Tag, MessageCircle } from 'lucide-react';

const FREE_DELIVERY_FROM = 150;

const fieldStyle = {
  width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
  border: '1px solid var(--clr-border)', backgroundColor: '#283220',
  outline: 'none', color: 'var(--clr-text)', fontSize: '14.5px', transition: 'var(--transition)'
};

const InputField = ({ icon: Icon, onBlur, ...props }) => (
  <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)', pointerEvents: 'none' }}>
      <Icon size={18} aria-hidden="true" />
    </div>
    <input
      required
      className="store-input"
      style={fieldStyle}
      onFocus={e => e.target.style.borderColor = 'var(--clr-rose)'}
      {...props}
      onBlur={e => { e.target.style.borderColor = 'var(--clr-border)'; onBlur?.(e); }}
    />
  </div>
);

const todayLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function Checkout() {
    const { items, total, clearCart, removeFromCart, updateQty, syncCart } = useCart();
    const { products, loading: productsLoading, loadFailed, refreshProducts } = useProducts();
    const { t, getLoc } = useLocale();
    const { profile } = useAuth();
    const navigate = useNavigate();

  usePageMeta(t('checkout'));

  // Promokod üçün state-lər
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Promokod yoxlama funksiyası
  const handleApplyPromo = async () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const { data, error } = await supabase.rpc('check_promo', { p_code: code });
    if (error) {
      console.error('Promokod xətası:', error);
      setPromoError(t('chk_error'));
    } else if (data) {
      setAppliedPromo(data);
    } else {
      setPromoError(t('chk_promo_invalid'));
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  // Endirimin hesablanması
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = Math.round(total * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountFixed) {
      discountAmount = Math.min(total, appliedPromo.discountFixed);
    }
  }

  const deliveryFee = 0;
  const finalTotal = Math.max(0, total - discountAmount + deliveryFee);

  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', note: '', date: '', time: '12:00'
  });
  const [receiveType, setReceiveType] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState(null);
  const [formError, setFormError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneInvalid = phoneTouched && formData.phone.trim() !== '' && !isValidAzPhone(formData.phone);

  // Səbətdəki köhnə qiymətlər və satışdan çıxmış məhsullar yenilənir
  useEffect(() => {
    if (productsLoading || loadFailed || success) return;
    if (syncCart(products)) setFormError(t('chk_price_changed'));
  }, [products, productsLoading, loadFailed, success]);

  // Daxil olmuş müştərinin məlumatlarını avtomatik doldurur
  useEffect(() => {
    if (!profile) return;
    setFormData(prev => ({
      ...prev,
      name: prev.name || profile.full_name || '',
      phone: prev.phone || profile.phone || '',
      address: prev.address || profile.address || ''
    }));
  }, [profile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const hours = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const deliveryLabel = receiveType === 'pickup' || total >= FREE_DELIVERY_FROM ? t('chk_free') : t('chk_delivery_tbd');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || loading) return;

    setFormError('');
    if (!isValidAzPhone(formData.phone)) {
      setPhoneTouched(true);
      setFormError(t('chk_phone_invalid'));
      return;
    }

    setLoading(true);

    try {
      // Qiymət və yekun məbləğ serverdə hesablanır, brauzer yalnız məhsul və sayı göndərir
      const { data, error } = await supabase.rpc('create_order', {
        p_name: formData.name,
        p_phone: formData.phone,
        p_address: formData.address,
        p_date: formData.date,
        p_time: formData.time,
        p_receive_type: receiveType,
        p_note: formData.note,
        p_items: items.map(item => ({ product_id: item.id, quantity: item.qty })),
        p_promo: appliedPromo?.code || null,
        p_expected_total: finalTotal
      });

      if (error) throw error;

      setOrderCode(data.id.slice(0, 8).toUpperCase());
      setSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error('Sifariş xətası:', err);
      const reason = err.message || '';
      if (reason.includes('price_changed') || reason.includes('product_unavailable')) {
        setFormError(t('chk_price_changed'));
        refreshProducts();
      } else if (reason.includes('invalid_promo')) {
        handleRemovePromo();
        setFormError(t('chk_promo_invalid'));
      } else if (reason.includes('invalid_phone')) {
        setFormError(t('chk_phone_invalid'));
      } else if (reason.includes('invalid_date')) {
        setFormError(t('chk_date_invalid'));
      } else {
        setFormError(t('chk_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-fade" style={{ backgroundColor: 'var(--clr-bg)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          backgroundColor: 'var(--clr-surface)', padding: '56px 32px', borderRadius: 'var(--radius-lg)',
          textAlign: 'center', maxWidth: '500px', border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-card)'
        }}>
          <CheckCircle size={64} color="var(--clr-rose)" strokeWidth={1.2} style={{ margin: '0 auto 24px' }} />
          <h2 className="display-title" style={{ marginBottom: '16px' }}>
            {t('chk_thanks')}, {formData.name.split(' ')[0]}!
          </h2>
          <p style={{ color: 'var(--clr-rose-lt)', fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}>
            {t('chk_order_code')}: #{orderCode}
          </p>
          <p style={{ color: 'var(--clr-muted)', lineHeight: '1.7', marginBottom: '32px', fontSize: '15px' }}>{t('chk_success')}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={whatsappLink(`${t('chk_wa_msg')} #${orderCode}`)} target="_blank" rel="noreferrer" className="btn-primary" style={{ gap: '8px' }}>
              <MessageCircle size={18} /> {t('chk_wa_confirm')}
            </a>
            <button onClick={() => navigate('/')} className="btn-ghost">
              {t('chk_back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <ShoppingBag size={64} strokeWidth={1} style={{ marginBottom: '24px', opacity: 0.4 }} />
        <h2 className="display-title">{t('chk_empty')}</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>{t('go_shop')}</button>
      </div>
    );
  }

  const sectionTitle = { fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--clr-rose)', marginBottom: '20px' };
  const receiveBtn = (active) => ({
    flex: 1, padding: '16px 10px', borderRadius: '12px',
    background: active ? 'rgba(212,191,126,0.12)' : 'var(--clr-surface)',
    color: active ? 'var(--clr-rose-lt)' : 'var(--clr-text)',
    border: active ? '1px solid var(--clr-rose)' : '1px solid var(--clr-border)',
    fontWeight: '600', fontSize: '14px', transition: 'var(--transition)'
  });

  return (
    <div className="page-fade" style={{ backgroundColor: 'var(--clr-bg)', minHeight: '100vh' }}>
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate('/')} style={{ color: 'inherit', fontSize: 'inherit' }}>{t('home')}</button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--clr-white)', fontWeight: '500' }}>{t('checkout')}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '100px', maxWidth: '1120px' }}>
        <h1 className="display-title" style={{ marginBottom: '36px' }}>{t('checkout')}</h1>

        <div className="checkout-grid">

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
            <section>
              <h3 style={sectionTitle}>{t('chk_receive_type')}</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button type="button" aria-pressed={receiveType === 'delivery'} onClick={() => setReceiveType('delivery')} style={receiveBtn(receiveType === 'delivery')}>
                   <Truck size={18} style={{ display: 'block', margin: '0 auto 8px' }} />
                   {t('chk_delivery_type')}
                 </button>
                 <button type="button" aria-pressed={receiveType === 'pickup'} onClick={() => setReceiveType('pickup')} style={receiveBtn(receiveType === 'pickup')}>
                   <MapPin size={18} style={{ display: 'block', margin: '0 auto 8px' }} />
                   {t('chk_pickup')}
                 </button>
              </div>
              {receiveType === 'pickup' && (
                <p style={{ fontSize: '13.5px', color: 'var(--clr-muted)', lineHeight: '1.6', marginTop: '12px' }}>
                  {t('chk_pickup_info')} <strong style={{ color: 'var(--clr-text)', fontWeight: '500' }}>{siteConfig.address}</strong>
                </p>
              )}
            </section>

            <section>
              <h3 style={sectionTitle}>{t('chk_info')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputField icon={User} name="name" autoComplete="name" aria-label={t('chk_name')} value={formData.name} onChange={handleChange} placeholder={t('chk_name')} />
                <InputField icon={Phone} type="tel" name="phone" autoComplete="tel" inputMode="tel" aria-label={t('chk_phone')} value={formData.phone} onChange={handleChange} onBlur={() => setPhoneTouched(true)} aria-invalid={phoneInvalid} aria-describedby="phone-hint" placeholder={t('chk_phone')} />
                {phoneInvalid && (
                  <p id="phone-hint" role="alert" style={{ color: '#ff8585', fontSize: '13px', marginTop: '-8px' }}>{t('chk_phone_invalid')}</p>
                )}
                {receiveType === 'delivery' && (
                  <InputField icon={MapPin} name="address" autoComplete="street-address" aria-label={t('chk_address')} value={formData.address} onChange={handleChange} placeholder={t('chk_address')} />
                )}
                <div className="form-row">
                  <InputField icon={Calendar} type="date" name="date" aria-label={t('chk_date')} min={todayLocal()} value={formData.date} onChange={handleChange} />

                  <div style={{ position: 'relative', minWidth: 0 }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)', pointerEvents: 'none' }}>
                      <Clock size={18} />
                    </div>
                    <select
                      name="time"
                      aria-label={t('chk_hour')}
                      className="store-input"
                      value={formData.time}
                      onChange={handleChange}
                      style={fieldStyle}
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
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
                    aria-label={t('chk_note')}
                    value={formData.note}
                    onChange={handleChange}
                    placeholder={t('chk_note')}
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                </div>
              </div>
            </section>

            {formError && (
              <p role="alert" style={{ color: '#ff8585', fontSize: '14px', backgroundColor: 'rgba(186,26,26,0.12)', border: '1px solid rgba(255,133,133,0.35)', padding: '12px 16px', borderRadius: '10px' }}>
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '60px', justifyContent: 'center', fontSize: '16px' }}
            >
              {loading ? t('chk_sending') : `${t('chk_confirm')} · ${formatPrice(finalTotal)} AZN`}
            </button>
          </form>

          <aside className="checkout-summary" style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '24px', minWidth: 0
          }}>
            <h3 style={sectionTitle}>
              {t('chk_order')} ({items.length})
            </h3>

            {/* Məhsulların Siyahısı, Say Dəyişməsi və Silinməsi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--clr-surface2)', padding: '10px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
                   <div style={{ width: '56px', height: '68px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                     <img src={getThumbUrl(item.img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>

                   <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '600', letterSpacing: 0, color: 'var(--clr-white)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getLoc(item.name)}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--clr-rose-lt)', fontWeight: '700', marginBottom: '6px' }}>
                        {formatPrice(item.price * item.qty)} AZN
                      </div>

                      {/* + / - Say İdarəetməsi */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--clr-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#181e14' }}>
                        <button type="button" aria-label={t('chk_decrease')} onClick={() => updateQty(item.id, -1)} style={{ padding: '6px 10px', color: 'var(--clr-text)' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', padding: '0 4px', minWidth: '20px', textAlign: 'center', color: 'var(--clr-white)' }}>
                          {item.qty}
                        </span>
                        <button type="button" aria-label={t('chk_increase')} onClick={() => updateQty(item.id, 1)} style={{ padding: '6px 10px', color: 'var(--clr-text)' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                   </div>

                   {/* Zibil qutusu (Silmə) */}
                   <button
                     type="button"
                     onClick={() => removeFromCart(item.id)}
                     aria-label={t('chk_remove_item')}
                     title={t('chk_remove_item')}
                     style={{ color: '#ff8585', padding: '8px', flexShrink: 0 }}
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
            </div>

            {/* Promokod Xanası */}
            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '16px', marginBottom: '20px' }}>
              <label htmlFor="promo-code" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--clr-muted)', marginBottom: '8px', fontWeight: '600' }}>
                <Tag size={14} color="var(--clr-rose)" /> {t('chk_promo_q')}
              </label>

              {appliedPromo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: 'rgba(107,117,84,0.25)', border: '1px solid var(--clr-green)', padding: '8px 12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--clr-rose-lt)', fontWeight: 'bold' }}>
                    ✓ {appliedPromo.code} {t('chk_promo_applied')} (-{formatPrice(discountAmount)} AZN)
                  </span>
                  <button type="button" onClick={handleRemovePromo} style={{ fontSize: '12px', color: '#ff8585', fontWeight: 'bold', flexShrink: 0 }}>
                    {t('chk_promo_remove')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="promo-code"
                    type="text"
                    placeholder={t('chk_promo_ph')}
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                    style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{ padding: '0 16px', borderRadius: '8px', border: '1px solid var(--clr-rose)', color: 'var(--clr-rose-lt)', fontWeight: '600', fontSize: '13px' }}
                  >
                    {t('chk_promo_apply')}
                  </button>
                </div>
              )}
              {promoError && <p role="alert" style={{ fontSize: '12px', color: '#ff8585', marginTop: '6px' }}>{promoError}</p>}
            </div>

            {/* Yekun Qiymət Cədvəli */}
            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--clr-muted)' }}>
                  <span>{t('chk_products')}:</span>
                  <span>{formatPrice(total)} AZN</span>
               </div>
               {discountAmount > 0 && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--clr-green-lt)', fontWeight: '600' }}>
                    <span>{t('chk_discount')} ({appliedPromo.code}):</span>
                    <span>-{formatPrice(discountAmount)} AZN</span>
                 </div>
               )}
               <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)' }}>
                  <span>{t('chk_delivery')}:</span>
                  <span style={{ color: 'var(--clr-green-lt)', textAlign: 'right' }}>{deliveryLabel}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '20px', fontWeight: '700', color: 'var(--clr-rose-lt)', marginTop: '8px', borderTop: '1px solid var(--clr-border)', paddingTop: '12px' }}>
                  <span>{t('total')}:</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{formatPrice(finalTotal)} AZN</span>
               </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
