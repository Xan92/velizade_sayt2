import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Truck, Flower2, Gift, PhoneCall } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useLocale } from '../context/LocaleContext';
import { db, ref, get, child } from '../config/firebase';

function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { t, getLoc } = useLocale();
  const featured = products.filter(p => p.featured);

  const [categories, setCategories] = useState([]);
  const [heroDesc, setHeroDesc] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const catSnap = await get(child(ref(db), 'admin_settings/categories'));
        if (catSnap.exists()) {
           setCategories(catSnap.val());
        }
        const heroSnap = await get(child(ref(db), 'admin_settings/cms/hero_desc'));
        if (heroSnap.exists()) {
           setHeroDesc(heroSnap.val());
        }
      } catch(err) {
        console.error("Error fetching CMS data", err);
      }
    };
    fetchHomeData();
  }, []);

  const testimonials = [
    { id: 1, author: 'Aytən M.', text: t('testimonial_1', '"Buketi aldım, annem çox sevdi. Keyfiyyət əla, çiçəklər bir həftə dayandı!"') },
    { id: 2, author: 'Rauf A.', text: t('testimonial_2', '"Sürətli çatdırılma, premium qablaşdırma. Növbəti dəfə də buradan alacam."') },
    { id: 3, author: 'Leyla H.', text: t('testimonial_3', '"Toy üçün süsləmə sifarişi verdim. Nəticə gözəl oldu, hər kəs bəyəndi!"') }
  ];

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)' }}>
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '92vh',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <img 
          src={`${import.meta.env.BASE_URL}assets/hero.png`} 
          alt="Premium Çiçək Koleksiyası" 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            filter: 'brightness(0.55)',
            transform: 'scale(1.04)',
            transition: 'transform 8s ease'
          }} 
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(17,21,16,0.75) 30%, transparent 90%)'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '620px', marginLeft: '0', paddingLeft: window.innerWidth < 768 ? '24px' : '80px' }}>
          <p style={{
            fontSize: '13.5px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--clr-rose-lt)',
            marginBottom: '16px'
          }}>{t('hero_subtitle', 'Yeni Kolleksiya 2026')}</p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: '500',
            lineHeight: '1.2',
            color: 'var(--clr-white)',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            {t('hero_title_1', 'Hər Anı')} <em style={{ color: 'var(--clr-rose-lt)', fontStyle: 'italic' }}>{t('hero_title_2', 'Gözəlləşdir')}</em>
          </h1>
          <p style={{
            fontSize: '17px',
            color: 'rgba(240,234,242,0.8)',
            marginBottom: '36px',
            maxWidth: '480px'
          }}>
            {heroDesc || t('hero_desc', 'Bakının ən premium gül kolleksiyası. İfadəsiz sevgi üçün mükəmməl buket.')}
          </p>
          {/* Buttons removed as per user request */}
        </div>
      </section>

      {/* Category Strip */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{t('collections', 'Kolleksiyalar')}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 640 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '30px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {[
              { id: 'roses', name: t('roses'), img: `${import.meta.env.BASE_URL}assets/cat_flowers.png` },
              { id: 'toys', name: t('toys'), img: `${import.meta.env.BASE_URL}assets/cute_premium_toy.png` },
              { id: 'bags', name: t('bags'), img: `${import.meta.env.BASE_URL}assets/premium_bags_cat.png` }
            ].map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => navigate(`/shop?cat=${cat.id}`)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                <div 
                  className="hover-card"
                  style={{ 
                    width: '125px', 
                    height: '125px',
                    margin: '0 auto 12px', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    border: '1px solid var(--clr-border)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={cat.img} 
                    alt={cat.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--clr-text)', 
                  letterSpacing: '0.02em',
                  display: 'block'
                }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{t('bestsellers')}</h2>
            <Link to="/shop" style={{ fontSize: '14.5px', color: 'var(--clr-rose-lt)', fontWeight: '500' }}>{t('see_all', 'Hamısına bax →')}</Link>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '24px' 
          }}>
            {featured.slice(0, 8).map((p) => (
               <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner Strip */}
      <section style={{
        background: 'var(--clr-surface)',
        borderTop: '1px solid var(--clr-border)',
        borderBottom: '1px solid var(--clr-border)',
        padding: '40px 24px'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Truck color="var(--clr-rose-lt)" size={32} />
            <div>
              <strong style={{ display: 'block', fontWeight: '600', marginBottom: '2px', fontSize: '14.5px' }}>{t('free_delivery', 'Pulsuz Çatdırılma')}</strong>
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)' }}>150₼+ sifarişlərə</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Flower2 color="var(--clr-rose-lt)" size={32} />
            <div>
              <strong style={{ display: 'block', fontWeight: '600', marginBottom: '2px', fontSize: '14.5px' }}>{t('fresh_flowers', 'Taze Güllər')}</strong>
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)' }}>Gündəlik yeniləmə</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Gift color="var(--clr-rose-lt)" size={32} />
            <div>
              <strong style={{ display: 'block', fontWeight: '600', marginBottom: '2px', fontSize: '14.5px' }}>{t('gift_wrap', 'Hədiyyə Qablaşdırma')}</strong>
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)' }}>Pulsuz bağlama</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <PhoneCall color="var(--clr-rose-lt)" size={32} />
            <div>
              <strong style={{ display: 'block', fontWeight: '600', marginBottom: '2px', fontSize: '14.5px' }}>{t('support_247', '24/7 Dəstək')}</strong>
              <p style={{ fontSize: '13px', color: 'var(--clr-muted)' }}>Həmişə yanınızdayıq</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ backgroundColor: 'var(--clr-surface)' }}>
        <div className="container">
          <h2 className="section-title">{t('testimonials_title', 'Müştəri Rəyləri')}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {testimonials.map((test) => (
              <div 
                key={test.id}
                style={{
                  background: 'var(--clr-surface2)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '28px 24px',
                  transition: 'transform var(--transition)'
                }}
              >
                <div style={{ color: 'var(--clr-gold)', fontSize: '16px', marginBottom: '12px' }}>★★★★★</div>
                <p style={{ fontSize: '14.5px', color: 'var(--clr-muted)', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.7' }}>{test.text}</p>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--clr-rose-lt)' }}>— {test.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
