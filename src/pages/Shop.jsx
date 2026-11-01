import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLocale } from '../context/LocaleContext';
import { supabase } from '../config/supabase';

function Shop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initCat = searchParams.get('cat') || 'all';
  const searchQueryParam = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(initCat);
  const [activeColor, setActiveColor] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortOption, setSortOption] = useState('default');
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t, getLoc } = useLocale();

  useEffect(() => {
    setActiveCategory(initCat);
  }, [initCat]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('sort_order');
        if (data) setCategories(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const { products, loading } = useProducts();

  const activeCategoryName = activeCategory === 'all'
    ? t('shop')
    : t(activeCategory, categories.find(c => c.id === activeCategory)?.name);
  usePageMeta(activeCategoryName);

  const resetFilters = () => {
    setActiveCategory('all');
    setActiveColor('all');
    setMaxPrice(500);
    if (searchQueryParam || initCat !== 'all') navigate('/shop');
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeColor !== 'all' && p.color !== activeColor) return false;
    if (p.price > maxPrice) return false;
    if (searchQueryParam) {
      const name = getLoc(p.name).toLowerCase();
      if (!name.includes(searchQueryParam.toLowerCase())) return false;
    }
    return true;
  });

  // Qiyməti olmayan məhsullar qiymət sıralamasında sonda qalır
  if (sortOption === 'price-asc') filteredProducts.sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  else if (sortOption === 'price-desc') filteredProducts.sort((a,b) => (b.price ?? -1) - (a.price ?? -1));
  else if (sortOption === 'name-asc') filteredProducts.sort((a,b) => getLoc(a.name).localeCompare(getLoc(b.name)));

  const colors = [
    { id: 'yellow', hex: '#FFEB3B', name: 'Sarı' },
    { id: 'red', hex: '#F44336', name: 'Qırmızı' },
    { id: 'purple', hex: '#9C27B0', name: 'Bənövşəyi' },
    { id: 'white', hex: '#FFFFFF', name: 'Ağ' },
    { id: 'pink', hex: '#E91E63', name: 'Çəhrayı' },
    { id: 'orange', hex: '#E8833A', name: 'Narıncı' }
  ];

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)' }}>
      {/* Breadcrumb Strip */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'var(--transition)' }}>{t('home')}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--clr-white)', fontWeight: '500' }}>{t('shop')}</span>
        </div>
      </div>

      <div className="container shop-layout">
        <button
          className="btn-ghost shop-filter-toggle"
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          style={{ justifyContent: 'center', gap: '10px', padding: '12px 20px' }}
        >
          <SlidersHorizontal size={18} /> {t('filters')}
        </button>

        {/* Sidebar Filters */}
        <aside className={`shop-filters${filtersOpen ? ' open' : ''}`} style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px'
        }}>
          {/* Categories */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--clr-rose)', marginBottom: '20px', letterSpacing: '0.05em' }}>{t('categories')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: activeCategory === 'all' ? 'var(--clr-white)' : 'var(--clr-muted)' }}>
                <input type="radio" name="shop-cat" value="all" checked={activeCategory === 'all'} onChange={() => setActiveCategory('all')} style={{ accentColor: 'var(--clr-green)', width: '16px', height: '16px' }} />
                {t('all', 'Hamısı')}
              </label>
              {categories.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: activeCategory === c.id ? 'var(--clr-white)' : 'var(--clr-muted)' }}>
                  <input type="radio" name="shop-cat" value={c.id} checked={activeCategory === c.id} onChange={() => setActiveCategory(c.id)} style={{ accentColor: 'var(--clr-green)', width: '16px', height: '16px' }} />
                  {t(c.id, c.name)}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '16px' }}>{t('price_range_title', 'Qiymət Aralığı')}</h3>
            <input
              type="range" min="0" max="500" value={maxPrice} step="10"
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--clr-green)', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--clr-rose-lt)', fontWeight: '600' }}>
              <span>0 AZN</span>
              <span>{maxPrice} AZN</span>
            </div>
          </div>

          {/* Color Filter */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '16px' }}>{t('color_filter', 'Rəng')}</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
               <button
                onClick={() => setActiveColor('all')}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: activeColor === 'all' ? '2px solid var(--clr-rose)' : '1px solid var(--clr-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent'
                }}
                title={t('all')}
                aria-label={t('all')}
                aria-pressed={activeColor === 'all'}
               >
                 <X size={14} color="var(--clr-muted)" />
               </button>
               {colors.map(c => (
                 <button
                  key={c.id}
                  onClick={() => setActiveColor(c.id)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c.hex,
                    border: activeColor === c.id ? '2px solid var(--clr-white)' : '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={activeColor === c.id}
                 />
               ))}
            </div>
          </div>

          <div>
             <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '16px' }}>{t('sort_title', 'Çeşidlə')}</h3>
             <select
               value={sortOption}
               onChange={e => setSortOption(e.target.value)}
               style={{ width: '100%', background: 'var(--clr-surface2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', color: 'var(--clr-text)', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
             >
                <option value="default">{t('sort_default', 'Standart')}</option>
                <option value="price-asc">{t('sort_price_asc', 'Qiymət: Aşağıdan Yuxarı')}</option>
                <option value="price-desc">{t('sort_price_desc', 'Qiymət: Yuxarıdan Aşağı')}</option>
                <option value="name-asc">A → Z</option>
             </select>
          </div>
        </aside>

        {/* Product Grid Main */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
             <h1 className="display-title" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}>
               {searchQueryParam ? `“${searchQueryParam}”` : activeCategoryName}
             </h1>
             <span style={{ fontSize: '13.5px', color: 'var(--clr-muted)' }}>{filteredProducts.length} {t('product_found', 'məhsul tapıldı')}</span>
          </div>

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--clr-muted)' }}>
               <p style={{ marginBottom: '24px' }}>{t('no_product', 'Təəssüf ki, axtarışınıza uyğun məhsul tapılmadı.')}</p>
               <button onClick={resetFilters} className="btn-ghost">{t('clear_filters')}</button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Shop;