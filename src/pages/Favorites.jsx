import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

function Favorites() {
  const { likes } = useWishlist();
  const { products } = useProducts();
  const { t } = useLocale();
  const likedProducts = products.filter(p => likes.includes(p.id));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ padding: '32px 20px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px' }}>
          {t('favorites')}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: '1.5' }}>
          Bəyəndiyiniz və yadda saxladığınız ən gözəl çiçəklər.
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>
        {likedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: '24px' }}>
             <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🤍</span>
             <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>{t('no_product')}</h2>
             <p style={{ fontSize: '13px', color: 'var(--color-outline)', marginBottom: '24px' }}>{t('cart_empty')}</p>
             <Link to="/shop" style={{
               padding: '12px 24px', borderRadius: '9999px',
               backgroundColor: 'var(--color-primary)', color: 'white',
               fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px'
             }}>
               İNDİ SEÇİN
             </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {likedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} style={{ transform: i % 2 !== 0 ? 'translateY(24px)' : 'none', paddingBottom: i % 2 !== 0 ? '24px' : '0' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
