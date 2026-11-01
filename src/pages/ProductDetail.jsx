import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, MessageCircle, Truck, Gift } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocale } from '../context/LocaleContext';
import { getAssetUrl } from '../config/imageUtils';
import { formatPrice, showToast, whatsappLink } from '../config/format';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle, isLiked } = useWishlist();
  const { products, loading } = useProducts();
  const { t, getLoc } = useLocale();
  const [qty, setQty] = useState(1);

  const product = products.find(p => String(p.id) === String(id));
  const name = product ? getLoc(product.name) : '';

  usePageMeta(name || undefined, product ? getLoc(product.desc) : undefined);
  useEffect(() => setQty(1), [id]);

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', backgroundColor: 'var(--clr-bg)', color: 'var(--clr-rose-lt)' }}>
      {t('loading', 'Yüklənir...')}
    </div>
  );

  if (!product) return (
    <div style={{ padding: '100px 24px', textAlign: 'center', backgroundColor: 'var(--clr-bg)', color: 'var(--clr-muted)' }}>
      <p style={{ marginBottom: '24px' }}>{t('no_product', 'Məhsul tapılmadı')}</p>
      <Link to="/shop" className="btn-primary">{t('go_shop')}</Link>
    </div>
  );

  const liked = isLiked(product.id);
  const hasPrice = product.price != null;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast(t('added', 'Səbətə əlavə edildi!'));
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="page-fade" style={{ backgroundColor: 'var(--clr-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container product-layout">

        {/* Image Block */}
        <div style={{
           width: '100%', aspectRatio: '4/5', backgroundColor: 'var(--clr-surface)',
           borderRadius: 'var(--radius-lg)', overflow: 'hidden',
           border: '1px solid var(--clr-border)',
           position: 'relative'
        }}>
           <img src={getAssetUrl(product.img)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           <button
             onClick={() => navigate(-1)}
             aria-label={t('back')}
             style={{ position: 'absolute', top: '16px', left: '16px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(17,21,16,0.75)', backdropFilter: 'blur(8px)', color: 'var(--clr-white)', border: '1px solid var(--clr-border)' }}
           >
             <ArrowLeft size={20} />
           </button>
           <button
             onClick={() => toggle(product.id)}
             aria-label={liked ? t('remove_fav') : t('add_fav')}
             style={{
               position: 'absolute', top: '16px', right: '16px',
               width: '44px', height: '44px', borderRadius: '50%',
               backgroundColor: liked ? 'var(--clr-rose)' : 'rgba(17,21,16,0.75)',
               backdropFilter: 'blur(8px)',
               border: '1px solid var(--clr-border)',
               color: liked ? '#1a1e14' : 'var(--clr-white)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)'
             }}
           >
             <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
           </button>
        </div>

        {/* Info Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <Link to={`/shop?cat=${product.category || 'all'}`} className="eyebrow" style={{ marginBottom: 0 }}>
             {product.badge || (product.category ? t(product.category) : t('premium'))}
           </Link>

           <h1 style={{
             fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.1rem, 3.6vw, 3.1rem)',
             fontWeight: '500', lineHeight: '1.12', letterSpacing: 0, color: 'var(--clr-white)'
           }}>
             {name}
           </h1>

           {hasPrice ? (
             <div style={{ fontSize: '30px', fontWeight: '600', color: 'var(--clr-rose-lt)' }}>
               {formatPrice(product.price)} AZN
               {product.oldPrice && (
                 <span style={{ fontSize: '18px', color: 'var(--clr-muted)', textDecoration: 'line-through', marginLeft: '12px', fontWeight: '400' }}>
                   {formatPrice(product.oldPrice)} AZN
                 </span>
               )}
             </div>
           ) : (
             <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--clr-rose-lt)' }}>{t('price_on_request')}</div>
           )}

           <p style={{ fontSize: '15.5px', color: 'var(--clr-muted)', lineHeight: '1.8' }}>
             {getLoc(product.desc)}
           </p>

           <div style={{ height: '1px', background: 'var(--clr-border)' }} />

           {hasPrice ? (
             <>
               <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span style={{ fontSize: '14.5px', color: 'var(--clr-muted)' }}>{t('qty')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      aria-label={t('chk_decrease')}
                      style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface2)', color: 'var(--clr-text)', fontSize: '18px' }}
                    >
                      <Minus size={16} />
                    </button>
                    <div style={{ width: '44px', textAlign: 'center', fontWeight: '600', color: 'var(--clr-white)', fontSize: '16px' }}>{qty}</div>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      aria-label={t('chk_increase')}
                      style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface2)', color: 'var(--clr-text)', fontSize: '18px' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                 <button
                   onClick={handleBuyNow}
                   className="btn-primary"
                   style={{ flex: 1, minWidth: '200px', height: '56px', justifyContent: 'center' }}
                 >
                   {t('buy_now')}
                 </button>
                 <button
                   onClick={handleAddToCart}
                   className="btn-ghost"
                   style={{ flex: 1, minWidth: '200px', height: '56px', justifyContent: 'center', gap: '10px' }}
                 >
                   <ShoppingBag size={20} /> {t('add_to_cart')}
                 </button>
               </div>
             </>
           ) : (
             <a
               href={whatsappLink(`${t('wa_product_msg')} ${name}`)}
               target="_blank"
               rel="noreferrer"
               className="btn-primary"
               style={{ height: '56px', justifyContent: 'center', gap: '10px', marginTop: '8px' }}
             >
               <MessageCircle size={20} /> {t('order_whatsapp')}
             </a>
           )}

           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={18} color="var(--clr-rose)" strokeWidth={1.5} /> {t('free_delivery_notice')}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Gift size={18} color="var(--clr-rose)" strokeWidth={1.5} /> {t('gift_wrap')} · {t('gift_wrap_desc')}</span>
           </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container" style={{ marginTop: '80px' }}>
          <h2 className="display-title" style={{ marginBottom: '32px' }}>{t('related_title')}</h2>
          <div className="products-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
