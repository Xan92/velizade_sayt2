import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import { db, ref, get, child } from '../config/firebase';

function Shop() {
  const [searchParams] = useSearchParams();
  const initCat = searchParams.get('cat') || 'all';

  const [activeCategory, setActiveCategory] = useState(initCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeColor, setActiveColor] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const { t, getLoc, lang } = useLocale();

  useEffect(() => {
    setActiveCategory(initCat);
    const fetchCats = async () => {
      try {
         const snap = await get(child(ref(db), 'admin_settings/categories'));
         if (snap.exists()) setCategories(snap.val());
      } catch (e) {
         console.error(e);
      }
    };
    fetchCats();
  }, [initCat]);

  const { products, loading } = useProducts();

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeColor !== 'all' && p.color !== activeColor) return false;
    if (p.price > maxPrice) return false;
    if (searchQuery) {
      const qs = searchQuery.toLowerCase();
      const n = getLoc(p.name).toLowerCase();
      const d = getLoc(p.desc).toLowerCase();
      return n.includes(qs) || d.includes(qs);
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', margin: '4px 0 8px' }}>
          {activeCategory === 'all' ? t('shop') : (t(activeCategory) || getLoc(categories.find(c => c.id === activeCategory)?.name) || activeCategory)}
        </h1>
        
        {/* Search */}
        <div style={{
          height: '48px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: '24px',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px'
        }}>
          <Search size={20} color="var(--color-outline)" />
          <input 
            type="text" 
            placeholder={`${t('search')}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--color-on-surface)' }}
          />
        </div>
      </div>

      {/* Categories / Filter Row */}
      <div className="custom-scrollbar" style={{ padding: '20px 16px', display: 'flex', overflowX: 'auto', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={() => setShowFilters(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
            backgroundColor: 'var(--color-surface-container-high)', borderRadius: '9999px',
            fontSize: '13px', fontWeight: '500', flexShrink: 0
          }}
        >
          <SlidersHorizontal size={16} /> Filter
        </button>

        <button 
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '10px 16px', borderRadius: '9999px', flexShrink: 0,
            backgroundColor: activeCategory === 'all' ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
            color: activeCategory === 'all' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
            fontSize: '13px', fontWeight: '500'
          }}
        >
          {t('all')}
        </button>

        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button 
              key={c.id} 
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '10px 16px', borderRadius: '9999px', flexShrink: 0,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                fontSize: '13px', fontWeight: '500'
              }}
            >
              {t(c.id) || getLoc(c.name)}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
             <p style={{ fontSize: '15px', color: 'var(--color-primary)' }}>Yüklənir...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
             <span style={{ fontSize: '48px' }}>🌸</span>
             <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--color-outline)' }}>{t('no_product')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} style={{ transform: i % 2 !== 0 ? 'translateY(24px)' : 'none', paddingBottom: i % 2 !== 0 ? '24px' : '0' }} />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal Backend */}
      {showFilters && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
           <div style={{
             width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface)',
             borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '16px 24px 32px'
           }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                 <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--color-outline-variant)', opacity: 0.4, borderRadius: '2px' }} />
              </div>
              
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>Filter</h2>
              
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Rəng</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {['all', 'red', 'pink', 'white', 'yellow', 'purple'].map(c => {
                   const cName = c === 'all' ? t('all') : c;
                   const isA = activeColor === c;
                   return (
                     <button key={c} onClick={() => setActiveColor(c)} style={{
                        padding: '8px 16px', borderRadius: '16px', fontSize: '13px',
                        backgroundColor: isA ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: isA ? 'white' : 'var(--color-on-surface)'
                     }}>
                       {cName}
                     </button>
                   );
                })}
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                 MAX: {maxPrice} AZN
              </h3>
              <input 
                type="range" min="10" max="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-secondary)', marginBottom: '32px' }}
              />

              <button 
                onClick={() => setShowFilters(false)}
                style={{
                  width: '100%', height: '56px', borderRadius: '9999px',
                  backgroundColor: 'var(--color-primary)', color: 'white',
                  fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px'
                }}
              >
                TƏTBİQ ET
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
