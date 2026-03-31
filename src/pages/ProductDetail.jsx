import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
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
  
  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Yüklənir...</div>;

  const product = products.find(p => p.id === parseInt(id));
  if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Məhsul tapılmadı</div>;

  const liked = isLiked(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    alert(t('added'));
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100 }} className="glass">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft color="var(--color-primary)" size={24} />
        </button>
        <button onClick={() => toggle(product.id)} style={{
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: liked ? 'rgba(118, 89, 45, 0.1)' : 'var(--color-surface-container-low)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Heart size={20} color={liked ? 'var(--color-error)' : 'var(--color-primary)'} fill={liked ? 'var(--color-error)' : 'none'} />
        </button>
      </div>

      {/* Image Block */}
      <div style={{
         width: '100%', aspectRatio: '4/5', backgroundColor: 'var(--color-surface-container-low)',
         borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden', padding: '72px 24px 24px',
         display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
         <img src={product.img} alt={product.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
           <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', flex: 1 }}>{getLoc(product.name)}</h1>
           <div style={{ textAlign: 'right', marginLeft: '16px' }}>
             <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{product.price} AZN</span>
             {product.oldPrice && <span style={{ fontSize: '14px', color: 'var(--color-outline-variant)', textDecoration: 'line-through', display: 'block' }}>{product.oldPrice} AZN</span>}
           </div>
         </div>

         <p style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', marginBottom: '32px' }}>
           {getLoc(product.desc)}
         </p>

         <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--color-primary)' }}>{t('qty')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '9999px', padding: '4px' }}>
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}
              >
                -
              </button>
              <span style={{ fontSize: '16px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{qty}</span>
              <button 
                onClick={() => setQty(q => q + 1)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}
              >
                +
              </button>
            </div>
         </div>
         
         <div style={{ display: 'flex', gap: '16px' }}>
           <button 
             onClick={handleAddToCart}
             style={{
               flex: 1, height: '56px', borderRadius: '9999px',
               backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-primary)',
               fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
             }}
           >
             <ShoppingCart size={18} /> {t('add_cart')}
           </button>
           <button 
             onClick={handleBuyNow}
             style={{
               flex: 1, height: '56px', borderRadius: '9999px',
               backgroundColor: 'var(--color-primary)', color: 'white',
               fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px'
             }}
           >
             {t('buy_now')}
           </button>
         </div>
      </div>
    </div>
  );
}

export default ProductDetail;
