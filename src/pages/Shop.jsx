import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import { db, ref, get, child } from '../config/firebase';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initCat = searchParams.get('cat') || 'all';

  const [activeCategory, setActiveCategory] = useState(initCat);
  const [activeColor, setActiveColor] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortOption, setSortOption] = useState('default');
  const [categories, setCategories] = useState([]);
  const { t, getLoc } = useLocale();

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

  // Categories Hierarchy
  const catGroups = [
    { title: t('roses', 'Güllər'), items: ['all', 'roses', 'bouquets', 'baskets'] },
    { title: t('toys', 'Oyuncaqlar'), items: ['toys'] },
    { title: t('bags', 'Çantalar'), items: ['bags'] }
  ];

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeColor !== 'all' && p.color !== activeColor) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  if (sortOption === 'price-asc') filteredProducts.sort((a,b) => a.price - b.price);
  else if (sortOption === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
  else if (sortOption === 'name-asc') filteredProducts.sort((a,b) => getLoc(a.name).localeCompare(getLoc(b.name)));

  const colors = [
    { id: 'yellow', hex: '#FFEB3B', name: 'Sarı' },
    { id: 'red', hex: '#F44336', name: 'Qırmızı' },
    { id: 'purple', hex: '#9C27B0', name: 'Bənövşəyi' },
    { id: 'blue', hex: '#2196F3', name: 'Göy' }
  ];

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)' }}>
      {/* Breadcrumb Strip */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '13.5px', color: 'var(--clr-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color='var(--clr-rose-lt)'} onMouseLeave={e => e.target.style.color='inherit'}>{t('home')}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--clr-white)', fontWeight: '500' }}>{t('shop')}</span>
        </div>
      </div>

      <div className="container" style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '260px 1fr', 
        gap: '40px', 
        paddingTop: '32px', 
        paddingBottom: '60px',
        alignItems: 'start'
      }}>
        
        {/* Sidebar Filters */}
        <aside style={{
          position: 'sticky',
          top: '110px',
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: window.innerWidth < 1024 ? 'none' : 'block'
        }}>
          {/* Categories Groups */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--clr-rose)', marginBottom: '20px', letterSpacing: '0.05em' }}>{t('categories')}</h3>
            {catGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--clr-muted)', marginBottom: '12px', letterSpacing: '0.1em' }}>{group.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group.items.map(catToken => {
                    const label = catToken === 'all' ? t('all') : (t(catToken) || catToken);
                    return (
                      <label key={catToken} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: activeCategory === catToken ? 'var(--clr-white)' : 'var(--clr-muted)', transition: 'var(--transition)' }}>
                        <input type="radio" name="shop-cat" value={catToken} checked={activeCategory === catToken} onChange={() => setActiveCategory(catToken)} style={{ accentColor: 'var(--clr-green)', width: '16px', height: '16px' }} />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '16px' }}>{t('price_range_title', 'Qiymət Aralığı')}</h3>
            <input 
              type="range" min="0" max="1000" value={maxPrice} step="10" 
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--clr-green)', marginBottom: '12px' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--clr-rose-lt)', fontWeight: '600' }}>
              <span>0₼</span>
              <span>{maxPrice}₼</span>
            </div>
          </div>

          {/* Color Filter */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '16px' }}>{t('color_filter', 'Rəng Seçimi')}</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <button 
                onClick={() => setActiveColor('all')}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', border: activeColor === 'all' ? '2px solid var(--clr-rose)' : '1px solid var(--clr-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent'
                }}
                title="Hamısı"
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
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'var(--transition)'
                  }}
                  title={c.name}
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

        {/* Mobile Filter Button Area */}
        {window.innerWidth < 1024 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px' }} className="custom-scrollbar">
               <button 
                onClick={() => setActiveCategory('all')}
                style={{ padding: '10px 20px', background: activeCategory === 'all' ? 'var(--clr-green)' : 'var(--clr-surface)', border: activeCategory === 'all' ? 'none' : '1px solid var(--clr-border)', borderRadius: '25px', color: activeCategory === 'all' ? 'var(--clr-rose)' : 'var(--clr-text)', fontSize: '13.5px', whiteSpace: 'nowrap', fontWeight: '600' }}
               >
                 {t('all')}
               </button>
               {['roses', 'bouquets', 'baskets', 'toys', 'bags'].map(catID => (
                 <button 
                  key={catID} 
                  onClick={() => setActiveCategory(catID)}
                  style={{ padding: '10px 20px', background: activeCategory === catID ? 'var(--clr-green)' : 'var(--clr-surface)', border: activeCategory === catID ? 'none' : '1px solid var(--clr-border)', borderRadius: '25px', color: activeCategory === catID ? 'var(--clr-rose)' : 'var(--clr-text)', fontSize: '13.5px', whiteSpace: 'nowrap', fontWeight: '600' }}
                 >
                   {t(catID) || catID}
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* Product Grid Main */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h2 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--clr-white)', textTransform: 'capitalize' }}>
               {activeCategory === 'all' ? t('shop') : (t(activeCategory) || getLoc(categories.find(c => c.id === activeCategory)?.name) || activeCategory)}
             </h2>
             <span style={{ fontSize: '13.5px', color: 'var(--clr-muted)' }}>{filteredProducts.length} {t('product_found', 'məhsul tapıldı')}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '80px' }}>
               <p style={{ fontSize: '16px', color: 'var(--clr-rose-lt)' }}>{t('loading', 'Yüklənir...')}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--clr-muted)' }}>
               <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌸</div>
               <p>{t('no_product', 'Təəssüf ki, axtarışınıza uyğun məhsul tapılmadı.')}</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '24px' 
            }}>
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
