import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import ProductCard from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';

function Favorites() {
  const { likes } = useWishlist();
  const { products } = useProducts();
  const { t } = useLocale();
  const navigate = useNavigate();
  const likedProducts = products.filter(p => likes.includes(p.id));

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)', minHeight: '80vh' }}>
      {/* Breadcrumb Strip */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color='var(--clr-rose-lt)'} onMouseLeave={e => e.target.style.color='inherit'}>{t('home')}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--clr-white)', fontWeight: '500' }}>{t('favorites')}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
           <Heart size={32} color="var(--clr-rose)" fill="var(--clr-rose)" />
           <h1 style={{ fontSize: '28px', fontWeight: '500', fontFamily: 'var(--font-serif)', color: 'var(--clr-white)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {t('favorites')}
           </h1>
        </div>

        {likedProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', marginTop: '40px', padding: '60px 24px', 
            backgroundColor: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' 
          }}>
             <div style={{ fontSize: '48px', display: 'block', marginBottom: '16px', opacity: 0.4 }}>🤍</div>
             <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--clr-white)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>{t('no_product')}</h2>
             <p style={{ fontSize: '14.5px', color: 'var(--clr-muted)', marginBottom: '32px' }}>{t('favorites_empty', 'Hələlik bəyəndiyiniz məhsul yoxdur.')}</p>
             <button onClick={() => navigate('/shop')} className="btn-primary">
               {t('go_shop', 'MAĞAZAYA KEÇ')}
             </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '24px' 
          }}>
            {likedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
