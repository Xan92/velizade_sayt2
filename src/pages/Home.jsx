import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Flower2, Gift, PhoneCall } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useReveal } from '../hooks/useReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLocale } from '../context/LocaleContext';
import { supabase } from '../config/supabase';
import { getAssetUrl } from '../config/imageUtils';

const productImg = (slug, thumb = true) => getAssetUrl(`assets/products/${slug}${thumb ? '-600' : ''}.webp`);

// Kateqoriya örtüklərində yalnız gül görünür, insan olan şəkil istifadə olunmur
const categoryCovers = {
  roses: 'assets/site/51-qirmizi-qizilgul-buketi.webp',
  baskets: 'assets/products/pastel-cehrayi-hasir-sebet-kompozisiyasi-600.webp',
  bouquets: 'assets/site/ag-benovseyi-qarisiq-bahar-buketi.webp',
  exclusive: 'assets/products/ag-anturium-mirvari-eksklyuziv-kompozisiya-600.webp',
  boxes: 'assets/products/qirmizi-qizilgul-evkalipt-qara-qutuda-600.webp',
};

function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { t } = useLocale();
  const featured = products.filter(p => p.featured);

  const [categories, setCategories] = useState([]);
  const [heroDesc, setHeroDesc] = useState('');

  usePageMeta();
  useReveal([loading, categories.length]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
        if (catData && catData.length > 0) {
          setCategories(catData);
        }

        const { data: settingsData } = await supabase.from('site_settings').select('*');
        if (settingsData) {
          const hero = settingsData.find(s => s.key === 'hero_desc');
          if (hero?.value) setHeroDesc(hero.value);
        }
      } catch(err) {
        console.error("Error fetching home data:", err);
      }
    };
    fetchHomeData();
  }, []);

  const defaultCategories = Object.keys(categoryCovers).map(id => ({ id, name: t(id), img: getAssetUrl(categoryCovers[id]) }));

  const displayCategories = categories.length > 0
    ? categories.map(c => ({
        id: c.id,
        name: t(c.id, c.name),
        img: getAssetUrl(categoryCovers[c.id] || c.image_url)
      }))
    : defaultCategories;

  const perks = [
    { Icon: Truck, title: t('free_delivery'), desc: t('free_delivery_desc') },
    { Icon: Flower2, title: t('fresh_flowers'), desc: t('fresh_flowers_desc') },
    { Icon: Gift, title: t('gift_wrap'), desc: t('gift_wrap_desc') },
    { Icon: PhoneCall, title: t('support_247'), desc: t('support_desc') },
  ];

  const lookbook = [
    { slug: 'benovseyi-xrizantema-buketi-hediyye', to: '/shop?cat=bouquets', alt: t('bouquets') },
    { slug: 'narinci-terrakota-payiz-buketi', to: '/shop?cat=bouquets', alt: t('bouquets') },
    { slug: 'hundur-payiz-hortenziya-anturium-kompozisiyasi', to: '/shop?cat=exclusive', alt: t('exclusive') },
  ];

  return (
    <div style={{ backgroundColor: 'var(--clr-bg)' }}>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="page-fade">
            <p className="eyebrow">{t('hero_subtitle')}</p>
            <h1 className="hero-title">
              {t('hero_title_1')} <em>{t('hero_title_2')}</em>
            </h1>
            <p style={{ fontSize: '16.5px', color: 'rgba(240,237,216,0.82)', marginBottom: '36px', maxWidth: '480px', lineHeight: '1.75' }}>
              {heroDesc || t('hero_desc')}
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/shop')} className="btn-primary">
                {t('buy_now')} →
              </button>
              <button onClick={() => navigate('/shop?cat=exclusive')} className="btn-ghost">
                {t('exclusive')}
              </button>
            </div>
          </div>
          <div className="hero-media">
            <div className="hero-arch">
              <img
                src={productImg('qirmizi-qutuda-qirmizi-gul-kompozisiyasi', false)}
                alt="Qırmızı qutuda qırmızı gül kompozisiyası — Aliza Flowers"
                width="470"
                height="588"
                fetchpriority="high"
              />
            </div>
            <div className="hero-inset">
              <img src={productImg('ag-anturium-mirvari-eksklyuziv-kompozisiya')} alt="Ağ anturium və mirvari kompozisiyası" width="180" height="225" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 className="display-title">{t('categories')}</h2>
          </div>
          <div className="cat-grid reveal">
            {displayCategories.map((cat) => (
              <Link key={cat.id} to={`/shop?cat=${cat.id}`} className="cat-tile">
                <div className="cat-arch">
                  <img src={cat.img} alt={cat.name} loading="lazy" />
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>{t('curated_eyebrow')}</p>
              <h2 className="display-title">{t('curated_title')}</h2>
            </div>
            <Link to="/shop" style={{ fontSize: '14.5px', color: 'var(--clr-rose-lt)', fontWeight: '500' }}>
              {t('see_all')}
            </Link>
          </div>

          <div className="products-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" />)
              : featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="section" style={{ background: 'var(--clr-surface)' }}>
        <div className="container">
          <div className="reveal" style={{ maxWidth: '620px', marginBottom: '40px' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>{t('story_eyebrow')}</p>
            <h2 className="display-title">{t('story_title')}</h2>
          </div>
          <div className="lookbook reveal">
            {lookbook.map(item => (
              <Link key={item.slug} to={item.to}>
                <img src={productImg(item.slug, false)} alt={item.alt} loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ marginBottom: '40px' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>{t('how_eyebrow')}</p>
            <h2 className="display-title">{t('how_title')}</h2>
          </div>
          <div className="steps reveal">
            {[1, 2, 3].map(n => (
              <div key={n} style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '24px' }}>
                <span className="step-num">0{n}</span>
                <h3 style={{ fontSize: '21px', fontWeight: '600', color: 'var(--clr-white)', letterSpacing: 0, marginBottom: '8px' }}>{t(`step${n}_t`)}</h3>
                <p style={{ fontSize: '14.5px', color: 'var(--clr-muted)', lineHeight: '1.7' }}>{t(`step${n}_d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner Strip */}
      <section style={{
        background: 'var(--clr-surface)',
        borderTop: '1px solid var(--clr-border)',
        borderBottom: '1px solid var(--clr-border)',
        padding: '40px 0'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {perks.map(({ Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Icon color="var(--clr-rose-lt)" size={28} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <strong style={{ display: 'block', fontWeight: '600', marginBottom: '2px', fontSize: '14.5px' }}>{title}</strong>
                <p style={{ fontSize: '13px', color: 'var(--clr-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}

export default Home;
