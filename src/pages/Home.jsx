import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import { db, ref, get, child } from '../config/firebase';
import { useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { t, getLoc } = useLocale();
  const featured = products.filter(p => p.featured);

  const [categories, setCategories] = useState([]);
  const [siteLogo, setSiteLogo] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const logoSnap = await get(child(ref(db), 'admin_settings/cms/logo'));
        if (logoSnap.exists()) setSiteLogo(logoSnap.val());
        
        const catSnap = await get(child(ref(db), 'admin_settings/categories'));
        if (catSnap.exists()) {
           setCategories(catSnap.val());
        }
      } catch(err) {
        console.error("Error fetching CMS data", err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>



      {/* Logo Banner */}
      <section style={{ padding: '0px 20px 24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '144px', height: '144px',
          borderRadius: '50%', backgroundColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(56,69,50,0.1)'
        }}>
          <img src={siteLogo || `${import.meta.env.BASE_URL}assets/logo.png`} alt="Velizade Flowers" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.25)' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>VELİZADƏ</span>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '24px 20px 0', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>{t('categories')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
             <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="var(--color-secondary)" />
             </button>
             <Link to="/shop" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-secondary)', letterSpacing: '1px' }}>{t('all')}</Link>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '24px' }}>
          {categories.filter(c => c.img).map((cat, i) => (
            <button key={i} onClick={() => navigate(`/shop?cat=${cat.id}`)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', flexShrink: 0
            }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                backgroundColor: 'var(--color-surface-container-highest)', padding: '2px', marginBottom: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid var(--color-surface-container-high)'
              }}>
                <img src={cat.img} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'center' }}>{t(cat.id) || getLoc(cat.name)}</span>
            </button>
          ))}
          {categories.filter(c => c.img).length === 0 && (
            <p style={{ color: 'var(--color-outline)', fontSize: '14px', width: '100%', textAlign: 'center' }}>Admin Paneldən kateqoriya şəkli yüklənincə görünəcək.</p>
          )}
        </div>
      </section>



      {/* Bestsellers Grid */}
      <section style={{ padding: '24px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>{t('bestsellers')}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {featured.map((p) => (
             <ProductCard key={p.id} product={p} style={{ paddingBottom: '0' }} />
          ))}
        </div>
        <div style={{ height: '32px' }} />
      </section>
    </div>
  );
}

export default Home;
