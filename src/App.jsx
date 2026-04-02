import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Heart, User, X, Home as HomeIcon, Grid, Phone, Info, Instagram, Facebook, MapPin } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useLocale } from './context/LocaleContext';
import { db, ref, get, child } from './config/firebase';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { itemCount } = useCart();
  const { likes } = useWishlist();
  const { lang, setLang, t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState(null);

  const isAdminPath = location.pathname.startsWith('/admin');

  // Close menu when route changes
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const snap = await get(child(ref(db), 'admin_settings/cms/logo'));
        if (snap.exists()) setSiteLogo(snap.val());
      } catch (err) {
        console.error("Error fetching logo", err);
      }
    };
    fetchLogo();
  }, []);

  return (
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
          <div style={{
            backgroundColor: 'var(--clr-green)',
            color: 'var(--clr-text)',
            fontSize: '13px',
            padding: '8px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>🚚 {t('free_delivery_notice', 'Bakı daxilindəki çatdırılma — PULSUZ (150₼+ sifariş)')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="tel:+994507902000" style={{ fontWeight: '600' }}>📞 +994 50 790 20 00</a>
              <select 
                value={lang} 
                onChange={e => setLang(e.target.value)} 
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
              >
                <option value="az" style={{color: 'black'}}>AZ</option>
                <option value="en" style={{color: 'black'}}>EN</option>
                <option value="ru" style={{color: 'black'}}>RU</option>
              </select>
            </div>
          </div>

          {/* STICKY HEADER */}
          <header style={{
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
            <div style={{
              width: '100%',
              maxWidth: '1240px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '32px'
            }}>
              {/* Hamburger (Mobile) */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                style={{ display: window.innerWidth < 1024 ? 'flex' : 'none', flexDirection: 'column', gap: '5px' }}
              >
                <div style={{ width: '22px', height: '2px', backgroundColor: 'var(--clr-text)', borderRadius: '2px' }} />
                <div style={{ width: '22px', height: '2px', backgroundColor: 'var(--clr-text)', borderRadius: '2px' }} />
                <div style={{ width: '22px', height: '2px', backgroundColor: 'var(--clr-text)', borderRadius: '2px' }} />
              </button>

              {/* Logo */}
              <Link to="/" style={{ 
                width: '74px', height: '74px', borderRadius: '50%', overflow: 'hidden', 
                border: '1px solid var(--clr-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <img 
                  src={siteLogo || `${import.meta.env.BASE_URL}assets/logo.png`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }} 
                />
              </Link>

              {/* Nav (Desktop) */}
              <nav style={{ display: window.innerWidth < 1024 ? 'none' : 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <Link to="/shop" style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: location.pathname === '/shop' ? 'var(--clr-white)' : 'var(--clr-muted)' }}>{t('shop')}</Link>
                <span style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: 'var(--clr-muted)', cursor: 'pointer' }}>{t('about')}</span>
                <span style={{ padding: '8px 14px', fontSize: '14.5px', fontWeight: '500', color: 'var(--clr-muted)', cursor: 'pointer' }}>{t('contact')}</span>
              </nav>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: window.innerWidth < 1024 ? 'auto' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder={t('search_placeholder', 'Axtar...')}
                    style={{ 
                      width: isSearchOpen ? '180px' : '0', 
                      opacity: isSearchOpen ? 1 : 0,
                      padding: isSearchOpen ? '7px 14px' : '0',
                      marginRight: isSearchOpen ? '6px' : '0',
                      transition: 'var(--transition)',
                      backgroundColor: 'var(--clr-surface2)',
                      border: '1px solid var(--clr-border)',
                      borderRadius: '20px',
                      color: 'var(--clr-text)',
                      outline: 'none'
                    }} 
                  />
                  <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--clr-muted)' }}>
                    <Search size={20} />
                  </button>
                </div>
                <button onClick={() => navigate('/favorites')} style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--clr-muted)' }}>
                  <Heart size={20} />
                  {likes.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '2px',
                      minWidth: '18px', height: '18px',
                      backgroundColor: 'var(--clr-rose)', color: '#111510',
                      fontSize: '11px', fontWeight: '700', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{likes.length}</span>
                  )}
                </button>
                <button onClick={() => navigate('/checkout')} style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--clr-muted)' }}>
                  <ShoppingBag size={20} />
                  {itemCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '2px',
                      minWidth: '18px', height: '18px',
                      backgroundColor: 'var(--clr-rose)', color: '#fff',
                      fontSize: '11px', fontWeight: '700', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{itemCount}</span>
                  )}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px', borderLeft: '1px solid var(--clr-border)', paddingLeft: '12px' }}>
                  <a href="https://www.instagram.com/velizadeflowers?igsh=MXB5ZjdlcnpvdDBjMQ==" target="_blank" rel="noreferrer" style={{ color: 'var(--clr-muted)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Instagram size={18} />
                  </a>
                  <a href="https://www.tiktok.com/@velizadeflowers" target="_blank" rel="noreferrer" style={{ color: 'var(--clr-muted)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Side Menu Drawer */}
      {isMenuOpen && !isAdminPath && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100 }}>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} />
          <aside style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px',
            backgroundColor: 'var(--clr-surface)', borderRight: '1px solid var(--clr-border)',
            display: 'flex', flexDirection: 'column', transform: 'translateX(0)', transition: 'var(--transition)'
          }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--clr-rose)' }}>{t('menu', 'Menyu')}</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={24} color="var(--clr-muted)" /></button>
            </div>
            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
              <button onClick={() => navigate('/')} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--clr-text)' }}>
                <HomeIcon size={20} /> {t('home')}
              </button>
              <button onClick={() => navigate('/shop')} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--clr-text)' }}>
                <Grid size={20} /> {t('shop')}
              </button>
              <div style={{ margin: '12px 24px', height: '1px', backgroundColor: 'var(--clr-border)' }} />
              <button style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--clr-muted)' }}>
                <Phone size={20} /> {t('contact')}
              </button>
              <button style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--clr-muted)' }}>
                <Info size={20} /> {t('about')}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Footer */}
      {!isAdminPath && (
        <footer style={{ 
          backgroundColor: 'var(--clr-surface)', 
          borderTop: '1px solid var(--clr-border)',
          paddingTop: '80px',
          color: 'var(--clr-text)'
        }}>
          <div style={{
            maxWidth: '1240px', margin: '0 auto', padding: '0 24px 60px',
            display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)', gap: '40px'
          }}>
            <div>
              <Link to="/" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <img src={siteLogo || `${import.meta.env.BASE_URL}assets/logo.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }} />
              </Link>
              <p style={{ color: 'var(--clr-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                {t('footer_desc', 'Bakının ən gözəl çiçəkləri. Sizi gözəlləşdirmək üçün buradayıq.')}
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="https://www.instagram.com/velizadeflowers?igsh=MXB5ZjdlcnpvdDBjMQ==" target="_blank" rel="noreferrer" style={{ color: 'var(--clr-muted)' }}><Instagram size={20} /></a>
                <a href="https://www.tiktok.com/@velizadeflowers" target="_blank" rel="noreferrer" style={{ color: 'var(--clr-muted)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '16px', marginBottom: '24px' }}>{t('shop_title', 'Mağaza')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)' }}>
                <Link to="/shop?cat=roses">{t('roses', 'Güllər')}</Link>
                <Link to="/shop?cat=toys">{t('toys', 'Oyuncaqlar')}</Link>
                <Link to="/shop?cat=bags">{t('bags', 'Çantalar')}</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '16px', marginBottom: '24px' }}>{t('company_title', 'Şirkət')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)', alignItems: 'flex-start' }}>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>{t('about')}</button>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>{t('blog', 'Blog')}</button>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>{t('career', 'Karyera')}</button>
                <button style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>{t('contact')}</button>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--clr-white)', fontSize: '16px', marginBottom: '24px' }}>{t('contact')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--clr-muted)' }}>
                <a href="tel:+994507902000">+994 50 790 20 00</a>
                <a href="mailto:info@velizade.az">info@velizade.az</a>
                <p style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  Bakı, Nizami rayon, Qara Qarayev 7
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
            <p>© 2026 Velizade. {t('rights', 'Bütün hüquqlar qorunur.')}</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
