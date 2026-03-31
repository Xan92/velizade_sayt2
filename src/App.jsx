import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Heart, User, X, Home as HomeIcon, Grid, Phone, Info } from 'lucide-react';
import { useCart } from './context/CartContext';
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
  const { lang, setLang, t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState(null);

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

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: isAdminPath ? '0' : '72px' }}>
      {/* Navbar (fixed top) */}
      {!isAdminPath && (
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px',
        backgroundColor: 'rgba(252, 249, 243, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--color-surface-container-high)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setIsMenuOpen(true)}>
            <Menu color="var(--color-primary)" size={24} />
          </button>
          <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
            Velizade Flowers
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Language Switcher */}
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary)', cursor: 'pointer', outline: 'none' }}>
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>

          {/* Sipariş No */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
            <Phone size={14} color="var(--color-primary)" />
            <a href="tel:+994507902000" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              +994 50 790 20 00
            </a>
          </div>

          <button onClick={() => alert('Qeydiyyat tezliklə əlavə olunacaq')}>
            <User color="var(--color-primary)" size={24} />
          </button>
          <button onClick={() => navigate('/favorites')}>
            <Heart color="var(--color-primary)" size={24} />
          </button>
          <button style={{ position: 'relative' }} onClick={() => navigate('/checkout')}>
            <ShoppingBag color="var(--color-primary)" size={24} />
            {itemCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                backgroundColor: 'var(--color-secondary)', color: 'white',
                fontSize: '10px', fontWeight: 'bold',
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {itemCount}
              </div>
            )}
          </button>
        </div>
      </header>
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
      {isMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start'
        }}>
          {/* Drawer Content */}
          <div style={{
            width: '80%', maxWidth: '300px', backgroundColor: 'var(--color-surface)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 20px', backgroundColor: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'transparent' }}>
                   <img src={siteLogo || `${import.meta.env.BASE_URL}assets/logo.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.25)' }} onError={(e) => e.target.style.display='none'} />
                 </div>
                 <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>Velizade</span>
               </div>
               <button onClick={() => setIsMenuOpen(false)}>
                 <X color="var(--color-outline)" size={24} />
               </button>
            </div>
            
            {/* Nav Links */}
            <div style={{ flex: 1, padding: '20px 0' }}>
               <button onClick={() => navigate('/')} style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <HomeIcon size={20} color="var(--color-primary)" />
                 <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{t('home')}</span>
               </button>
               <button onClick={() => navigate('/shop')} style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <Grid size={20} color="var(--color-primary)" />
                 <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{t('shop')}</span>
               </button>
               <div style={{ margin: '12px 24px', height: '1px', backgroundColor: 'var(--color-surface-container-highest)' }} />
               <button onClick={() => { setIsMenuOpen(false); alert('Tezliklə!'); }} style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <User size={20} color="var(--color-primary)" />
                 <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{t('my_addresses')}</span>
               </button>
               <button style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <Phone size={20} color="var(--color-primary)" />
                 <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{t('contact')}</span>
               </button>
               <button style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <Info size={20} color="var(--color-primary)" />
                 <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{t('about')}</span>
               </button>
            </div>
          </div>
          {/* Backdrop Closer */}
          <div style={{ flex: 1 }} onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      {/* Footer */}
      {!isAdminPath && (
      <footer style={{
        backgroundColor: 'var(--color-surface-container-low)',
        padding: '40px 24px',
        marginTop: '60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        {/* We reuse the mobile logo or just text */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden'
        }}>
          <img src={siteLogo || `${import.meta.env.BASE_URL}assets/logo.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.25)' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
          <span style={{ display: 'none', fontSize: '10px', color: 'var(--color-primary)' }}>LOGO</span>
        </div>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', maxWidth: '300px', marginBottom: '20px', lineHeight: '1.6' }}>
          {t('footer_desc')}
        </p>
        <p style={{ color: 'var(--color-outline)', fontSize: '14px', marginBottom: '8px' }}>+994 50 790 20 00</p>
        <p style={{ color: 'var(--color-outline-variant)', fontSize: '12px', marginBottom: '24px' }}>Bakı, Nizami küç. 42</p>
        <p style={{ color: 'var(--color-outline-variant)', fontSize: '11px' }}>© 2026 Velizade. {t('rights')}</p>
      </footer>
      )}
    </div>
  );
}

export default App;
