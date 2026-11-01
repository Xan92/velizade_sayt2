import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, X, Menu, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useLocale } from './context/LocaleContext';
import { useAuth } from './context/AuthContext';
import { supabase } from './config/supabase';
import { siteConfig } from './config/siteConfig';
import { getAssetUrl } from './config/imageUtils';
import { whatsappLink } from './config/format';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));

const LOGO = 'assets/aliza-flowers-logo.jpg';

function NotFound() {
  const { t } = useLocale();
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '60px 24px', textAlign: 'center' }}>
      <h1 className="display-title">{t('not_found_title')}</h1>
      <Link to="/shop" className="btn-primary">{t('go_shop')}</Link>
    </div>
  );
}

function App() {
  const { itemCount } = useCart();
  const { likes } = useWishlist();
  const { lang, setLang, t } = useLocale();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [aboutText, setAboutText] = useState('Hər cür sifarişlər qəbul olunur');

  const isAdminPath = location.pathname.startsWith('/admin');
  const logoSrc = getAssetUrl(LOGO);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.search]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!showAbout && !isMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowAbout(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAbout, isMenuOpen]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
          const aboutSetting = data.find(s => s.key === 'about_text');
          if (aboutSetting?.value) setAboutText(aboutSetting.value);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const iconBtn = { width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--clr-muted)', flexShrink: 0 };
  const countBadge = {
    position: 'absolute', top: '3px', right: '3px',
    minWidth: '18px', height: '18px',
    backgroundColor: 'var(--clr-rose)', color: '#111510',
    fontSize: '11px', fontWeight: '700', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  };

  return (
    <>
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: isAdminPath ? 'var(--color-on-surface)' : 'var(--clr-text)',
      backgroundColor: isAdminPath ? 'var(--color-background)' : 'var(--clr-bg)'
    }}>

      {!isAdminPath && (
        <>
          {/* TOP INFO BAR */}
          <div className="top-bar" style={{
            backgroundColor: '#20281a',
            color: 'var(--clr-text)',
            fontSize: '12.5px',
            padding: '8px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '4px 16px'
          }}>
            <span className="top-bar-notice">{t('free_delivery_notice')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" style={{ fontWeight: '600' }}>{siteConfig.phone}</a>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                aria-label="Dil seçimi"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
              >
                <option value="az" style={{color: 'black'}}>AZ</option>
                <option value="en" style={{color: 'black'}}>EN</option>
                <option value="ru" style={{color: 'black'}}>RU</option>
              </select>
            </div>
          </div>

          {/* STICKY HEADER */}
          <header className="site-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
            backgroundColor: 'rgba(17, 21, 16, 0.94)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--clr-border)',
            height: '90px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div className="site-header-inner" style={{
              width: '100%',
              maxWidth: '1240px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              position: 'relative'
            }}>
              {/* Logo */}
              <Link to="/" aria-label="Aliza Flowers — Ana Səhifə" style={{
                display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid var(--clr-rose)',
                  flexShrink: 0,
                  backgroundColor: '#3e4536'
                }}>
                  <img
                    src={logoSrc}
                    alt="Aliza Flowers Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    fontWeight: '600',
                    letterSpacing: '0.14em',
                    color: 'var(--clr-rose-lt)',
                    lineHeight: '1.05'
                  }}>
                    ALIZA
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9.5px',
                    fontWeight: '600',
                    letterSpacing: '0.3em',
                    color: 'var(--clr-muted)',
                    textTransform: 'uppercase',
                    marginTop: '2px'
                  }}>
                    Flowers
                  </span>
                </div>
              </Link>

              {/* Nav (Desktop) */}
              <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <Link to="/shop" style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: location.pathname === '/shop' ? 'var(--clr-white)' : 'var(--clr-muted)' }}>{t('shop')}</Link>
                <button onClick={() => setShowAbout(true)} style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: 'var(--clr-muted)' }}>{t('about')}</button>
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: 'var(--clr-muted)' }}>{t('contact')}</a>
              </nav>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="site-search"
                    role="searchbox"
                    className={`header-search-input${isSearchOpen ? ' open' : ''}`}
                    aria-label={t('search_placeholder')}
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    style={{
                      transition: 'var(--transition)',
                      backgroundColor: 'var(--clr-surface2)',
                      borderStyle: 'solid',
                      borderColor: 'var(--clr-border)',
                      borderRadius: '20px',
                      color: 'var(--clr-text)',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label={isSearchOpen ? 'Axtarışı bağla' : 'Axtarışı aç'}
                    aria-expanded={isSearchOpen}
                    aria-controls="site-search"
                    style={iconBtn}>
                    <Search size={20} />
                  </button>
                </div>

                {/* Profile / Auth Button */}
                <button
                  className="desktop-only"
                  onClick={() => navigate(user ? '/profile' : '/auth')}
                  aria-label={user ? t('my_profile') : t('login')}
                  style={{ ...iconBtn, color: user ? 'var(--clr-rose)' : 'var(--clr-muted)' }}
                  title={user ? (profile?.full_name || t('my_profile')) : t('login')}
                >
                  <User size={20} />
                </button>

                <button
                  onClick={() => navigate('/favorites')}
                  aria-label={`${t('favorites')}${likes.length > 0 ? ` (${likes.length})` : ''}`}
                  style={{ ...iconBtn, position: 'relative' }}>
                  <Heart size={20} aria-hidden="true" />
                  {likes.length > 0 && <span style={countBadge}>{likes.length}</span>}
                </button>

                <button
                  onClick={() => navigate('/checkout')}
                  aria-label={`${t('checkout')}${itemCount > 0 ? ` (${itemCount})` : ''}`}
                  style={{ ...iconBtn, position: 'relative' }}>
                  <ShoppingBag size={20} aria-hidden="true" />
                  {itemCount > 0 && <span style={countBadge}>{itemCount}</span>}
                </button>

                <a className="desktop-only" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" style={iconBtn}>
                  <Instagram size={18} />
                </a>

                <button className="menu-btn" onClick={() => setIsMenuOpen(true)} aria-label={t('menu')} aria-expanded={isMenuOpen} style={iconBtn}>
                  <Menu size={22} />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Drawer */}
          {isMenuOpen && (
            <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label={t('menu')}>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Bağla" style={{ ...iconBtn, alignSelf: 'flex-end', color: 'var(--clr-text)' }}><X size={26} /></button>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>{t('home')}</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>{t('shop')}</Link>
              <Link to={user ? '/profile' : '/auth'} onClick={() => setIsMenuOpen(false)}>{user ? t('my_profile') : t('login')}</Link>
              <button className="drawer-link" onClick={() => { setIsMenuOpen(false); setShowAbout(true); }}>{t('about')}</button>
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">{t('contact')}</a>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      {!isAdminPath && (
        <footer style={{
          backgroundColor: 'var(--clr-surface)',
          borderTop: '1px solid var(--clr-border)',
          paddingTop: '72px',
          color: 'var(--clr-text)'
        }}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: '0 24px 56px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid var(--clr-border)',
                  flexShrink: 0,
                  backgroundColor: '#181e14'
                }}>
                  <img src={logoSrc} alt="Aliza Flowers Logo" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '23px', fontWeight: '600', color: 'var(--clr-white)' }}>Aliza Flowers</span>
              </div>
              <p style={{ color: 'var(--clr-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                {t('footer_desc')}
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '20px', marginBottom: '20px' }}>{t('shop_title')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)' }}>
                <Link to="/shop?cat=roses">{t('roses')}</Link>
                <Link to="/shop?cat=baskets">{t('baskets')}</Link>
                <Link to="/shop?cat=bouquets">{t('bouquets')}</Link>
                <Link to="/shop?cat=exclusive">{t('exclusive')}</Link>
                <Link to="/shop?cat=boxes">{t('boxes')}</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '20px', marginBottom: '20px' }}>{t('company_title')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)', alignItems: 'flex-start' }}>
                <button onClick={() => setShowAbout(true)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>{t('about')}</button>
                <Link to={user ? "/profile" : "/auth"}>{user ? t('my_profile') : t('login')}</Link>
                <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
                <a href={siteConfig.tiktokUrl} target="_blank" rel="noreferrer">TikTok</a>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '20px', marginBottom: '20px' }}>{t('contact')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)' }}>
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">{siteConfig.phone}</a>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                <p style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {siteConfig.address}
                </p>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--clr-border)',
            padding: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--clr-muted)'
          }}>
            <p>© {new Date().getFullYear()} Aliza Flowers. {t('rights')}</p>
          </div>
        </footer>
      )}
    </div>

    {/* Floating WhatsApp */}
    {!isAdminPath && !isMenuOpen && (
      <a className="whatsapp-fab" href={whatsappLink(t('wa_general_msg'))} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <MessageCircle size={24} strokeWidth={1.6} />
      </a>
    )}

    {/* About Modal */}
    {showAbout && (
      <div onClick={() => setShowAbout(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div role="dialog" aria-modal="true" aria-label={t('about')} onClick={e => e.stopPropagation()} style={{
          background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)',
          padding: '48px 36px', maxWidth: '560px', width: '100%', position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
        }}>
          <button onClick={() => setShowAbout(false)} aria-label="Bağla" style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--clr-muted)' }}><X size={24} /></button>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: 'var(--clr-rose-lt)', marginBottom: '8px', letterSpacing: 0 }}>{t('about')}</h2>
          <div style={{ width: '60px', height: '1px', background: 'var(--clr-rose)', marginBottom: '24px' }} />
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--clr-text)', whiteSpace: 'pre-wrap' }}>{aboutText}</p>
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: 'var(--clr-surface2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
            <p style={{ fontSize: '14px', color: 'var(--clr-muted)', marginBottom: '8px' }}>{t('contact_us')}</p>
            <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" style={{ fontSize: '16px', color: 'var(--clr-rose-lt)', fontWeight: '600' }}>{siteConfig.phone} (WhatsApp)</a>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default App;
