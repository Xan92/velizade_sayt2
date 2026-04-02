import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocale } from '../context/LocaleContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle, isLiked } = useWishlist();
  const { products, loading } = useProducts();
  const { t, getLoc } = useLocale();
  const [qty, setQty] = useState(1);
  
  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', backgroundColor: 'var(--clr-bg)', color: 'var(--clr-rose-lt)' }}>
      {t('loading', 'Yüklənir...')}
    </div>
  );

  const product = products.find(p => p.id === parseInt(id));
  if (!product) return (
    <div style={{ padding: '100px', textAlign: 'center', backgroundColor: 'var(--clr-bg)', color: 'var(--clr-muted)' }}>
      {t('no_product', 'Məhsul tapılmadı')}
    </div>
  );

  const liked = isLiked(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    // Simple toast
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'var(--clr-green)';
    toast.style.color = 'var(--clr-rose)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = 10000;
    toast.style.fontWeight = 'bold';
    toast.innerText = t('added', 'Səbətə əlavə edildi!');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Header (Back Button and Heart) */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0 24px', zIndex: 100, backgroundColor: 'rgba(17, 21, 16, 0.6)', backdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--clr-surface)', color: 'var(--clr-white)', border: '1px solid var(--clr-border)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => toggle(product.id)} 
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: liked ? 'var(--clr-green)' : 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            color: liked ? 'var(--clr-rose)' : 'var(--clr-white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)'
          }}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap: '60px', paddingTop: '100px' }}>
        
        {/* Image Block */}
        <div style={{
           width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--clr-surface)',
           borderRadius: 'var(--radius-lg)', overflow: 'hidden',
           border: '1px solid var(--clr-border)',
           display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
           <img src={product.img} alt={getLoc(product.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Info Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={{ display: 'inline-block', background: 'var(--clr-rose)', color: '#1a1e14', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em', width: 'fit-content' }}>
             {product.badge || t('premium', 'Premium')}
           </div>
           
           <h1 style={{ 
             fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', 
             fontWeight: '500', lineHeight: '1.3', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-white)' 
           }}>
             {getLoc(product.name)}
           </h1>

           <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--clr-rose-lt)' }}>
             {product.price} AZN
             {product.oldPrice && (
               <span style={{ fontSize: '18px', color: 'var(--clr-muted)', textDecoration: 'line-through', marginLeft: '12px', fontWeight: '400' }}>
                 {product.oldPrice} AZN
               </span>
             )}
           </div>

           <p style={{ fontSize: '15.5px', color: 'var(--clr-muted)', lineHeight: '1.8' }}>
             {getLoc(product.desc)}
           </p>

           <div style={{ height: '1px', background: 'var(--clr-border)' }} />

           <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ fontSize: '14.5px', color: 'var(--clr-muted)' }}>{t('qty')}</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface2)', color: 'var(--clr-text)', fontSize: '18px' }}
                >
                  <Minus size={16} />
                </button>
                <div style={{ width: '44px', textAlign: 'center', fontWeight: '600', color: 'var(--clr-white)', fontSize: '16px' }}>{qty}</div>
                <button 
                  onClick={() => setQty(q => q + 1)}
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface2)', color: 'var(--clr-text)', fontSize: '18px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
           </div>

           <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
             <button 
               onClick={handleAddToCart}
               style={{
                 flex: 1, minWidth: '200px', height: '56px', borderRadius: '50px',
                 backgroundColor: 'var(--clr-surface2)', color: 'var(--clr-white)',
                 border: '1px solid var(--clr-border)',
                 fontSize: '15px', fontWeight: '600',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                 transition: 'var(--transition)'
               }}
               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
               onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-surface2)'}
             >
               <ShoppingBag size={20} /> {t('add_to_cart')}
             </button>
             <button 
               onClick={handleBuyNow}
               className="btn-primary"
               style={{ flex: 1, minWidth: '200px', height: '56px', justifyContent: 'center' }}
             >
               {t('buy_now')}
             </button>
           </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
