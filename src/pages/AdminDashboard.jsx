import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { db, ref, get, set, child } from '../config/firebase';
import { Package, Plus, Trash2, Edit, Star, DollarSign, Image as ImageIcon, X, CheckCircle, Clock, Settings, LogOut, BarChart2, ArrowDown, ArrowUp, Menu } from 'lucide-react';

function AdminDashboard() {
  const { products, loading: productsLoading, deleteProduct, updateProductStatus, addProduct, editProduct, updateProductOrder } = useProducts();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('velizade_admin') === 'true');
  const [password, setPassword] = useState('');
  
  // Navigation
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'settings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on tab change (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [activeTab]);

  const getAz = (str) => {
    if (!str) return '';
    if (typeof str === 'object') return str.az || '';
    return str;
  };

  // States for Add & Edit (Products)
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const initialProdState = { name: '', price: '', oldPrice: '', category: 'roses', color: 'all', desc: '', img: '', badge: '', badgeType: 'new' };
  const [newProd, setNewProd] = useState(initialProdState);
  const [editingId, setEditingId] = useState(null);

  // Analytics Sort Config
  const [sortConfig, setSortConfig] = useState({ key: 'qty', direction: 'desc' });
  const [analyticsDateRange, setAnalyticsDateRange] = useState({ start: '', end: '' });

  // Password Settings
  const [currentDbPassword, setCurrentDbPassword] = useState('velizade2026');
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });

  // Custom Categories
  const defaultCats = [
    { id: 'roses', name: 'Güllər', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEq5J-I9ld49e9RAt9aNKGa2iX7LIdndFbhDQAEz7N5nYbaJR7vuRPtrZq-yVb0lNnZ78hgUQQBKWGKBzDStgUUxA-tJTlpWD_zMgIp25P7ara3qopRM7Csiy6fgz7QBn_rKga96ZMBwqFTVpMxYpPybaHTnig0UkB6vTu14KQ8Jj1c2ssub2c-maTHWJ15kt-JQZGa1CXHItVOqeU6jtVjOqv7EQx3Xl6IToWm81ygQFF5CZXZ5IIyZ7sVr38lOU8EETHIbvyCGo' },
    { id: 'toys', name: 'Oyuncaqlar', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwdRTAq-itRQHDM855ClpPsg-ZOLANXiqAeFO0GcdDekrpZh1txQBwP8gObPU2XBYUEjDa8BBKBSSYgGEbKkokjnC8RCRTx2UArLPzacQbGje-utECwGUW_WxcE7IChxp4EAUR_aeb0Rdjv6OEMeqDiRjrSeSQpmVNdUVcNt6QZFngTfA_pkZa9WqYt2elBBjSX8fxlsoabT58z6XJH0A7xUp6kvf3wsExxcKUgSHeu8VlORJZoiCFN2gZ13IVNyhCDth0vFor0mo' },
    { id: 'bags', name: 'Çantalar', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsWhAvnDXxozZkETiw5zr9PTJv6jV6nlYt4ze7Tx-M6z4HznhB7LH0TVKBW0yO9xKw7kLTTB1pYb8eKe5KpUUhit1_wPQOphJK6dRaCsegcpLxRqowzzZyHcMbK9Ky0N0kHIyfa7qBGsTcyLdpwo8xEWHpNeQpWDZ_OFM5xg8ch9HJt04rqXdw9A_7E58F9v8rsjPQHihaV5GS6lTsMiEQHlBwEg5I8NaCSe6tYDFuIIepE0cv2z_NByP4fCub9_YfgjN3ZPcxRo' }
  ];
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [siteLogo, setSiteLogo] = useState(null);
  const [heroDesc, setHeroDesc] = useState('');

  useEffect(() => {
    // Fetch password from Firebase
    const fetchPassword = async () => {
      const snapshot = await get(child(ref(db), 'admin_settings/password'));
      if (snapshot.exists()) {
        setCurrentDbPassword(snapshot.val());
      } else {
        // If not exists, create default in DB
        set(ref(db, 'admin_settings/password'), 'velizade2026');
      }
      // Fetch categories
      const catSnap = await get(child(ref(db), 'admin_settings/categories'));
      if (catSnap.exists()) {
        const existing = catSnap.val().filter(c => c.id !== 'boxes');
        let needsUpdate = false;
        const patched = existing.map(c => {
           if (!c.img) {
              const def = defaultCats.find(d => d.id === c.id);
              if (def && def.img) {
                 needsUpdate = true;
                 return {...c, img: def.img};
              }
           }
           return c;
        });
        if (needsUpdate) {
           await set(ref(db, 'admin_settings/categories'), patched);
        }
        setCategories(patched);
      } else {
        set(ref(db, 'admin_settings/categories'), defaultCats);
        setCategories(defaultCats);
      }
      
      // Fetch logo
      const logoSnap = await get(child(ref(db), 'admin_settings/cms/logo'));
      if (logoSnap.exists()) {
        setSiteLogo(logoSnap.val());
      }

      // Fetch Hero Description
      const heroSnap = await get(child(ref(db), 'admin_settings/cms/hero_desc'));
      if (heroSnap.exists()) {
        setHeroDesc(heroSnap.val());
      }
    };
    fetchPassword();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === currentDbPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('velizade_admin', 'true');
    }
    else alert('Şifrə yanlışdır!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.old !== currentDbPassword) return alert('Köhnə şifrəniz səhvdir!');
    if (passwordForm.new !== passwordForm.confirm) return alert('Yeni şifrələr üst-üstə düşmür!');
    if (passwordForm.new.length < 5) return alert('Şifrə ən azı 5 simvol olmalıdır!');
    
    await set(ref(db, 'admin_settings/password'), passwordForm.new);
    setCurrentDbPassword(passwordForm.new);
    alert('Şifrə uğurla dəyişdirildi!');
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('velizade_admin');
    setIsAuthenticated(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if(!newCatName) return;
    const key = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!key) return alert('Düzgün ad yazın!');
    if(categories.some(c => c.id === key)) return alert('Bu kateqoriya artıq mövcuddur!');
    
    const upd = [...categories, { id: key, name: newCatName }];
    await set(ref(db, 'admin_settings/categories'), upd);
    setCategories(upd);
    setNewCatName('');
  };

  const handleDeleteCategory = async (catId) => {
    if(!window.confirm('Bu kateqoriyanı tamamilə silmək istədiyinizə əminsiniz?')) return;
    const upd = categories.filter(c => c.id !== catId);
    await set(ref(db, 'admin_settings/categories'), upd);
    setCategories(upd);
  };

  const handleCategoryImgUpload = async (catId, file) => {
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      const upd = categories.map(c => c.id === catId ? {...c, img: base64} : c);
      await set(ref(db, 'admin_settings/categories'), upd);
      setCategories(upd);
    } catch(err) {
       console.error(err);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compressed base64
        };
      };
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // 800px max width for logo to preserve detail but still compress
      const base64 = await compressImage(file);
      await set(ref(db, 'admin_settings/cms/logo'), base64);
      setSiteLogo(base64);
      alert('Mağaza Loqosu uğurla yeniləndi!');
    } catch(err) {
       console.error(err);
       alert('Xəta baş verdi!');
    }
  };

  const handleUpdateHeroDesc = async () => {
    try {
      await set(ref(db, 'admin_settings/cms/hero_desc'), heroDesc);
      alert('Hero mətni uğurla yeniləndi!');
    } catch(err) {
      console.error(err);
      alert('Xəta baş verdi!');
    }
  };

  const translateText = async (text, tl) => {
    if (!text) return '';
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=az&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch(err) {
      console.error('Translation error:', err);
      return text;
    }
  };

  const generateProductData = async () => {
    let finalImageUrl = newProd.img;
    if (imageFile) {
      finalImageUrl = await compressImage(imageFile);
    }
    
    // Auto-Translate Name and Desc
    let finalName = newProd.name;
    let finalDesc = newProd.desc;

    // Only translate if they are strings (e.g. they were edited or newly created in AZ)
    if (typeof newProd.name === 'string' && newProd.name.trim() !== '') {
       finalName = {
          az: newProd.name,
          en: await translateText(newProd.name, 'en'),
          ru: await translateText(newProd.name, 'ru')
       };
    }
    if (typeof newProd.desc === 'string' && newProd.desc.trim() !== '') {
       finalDesc = {
          az: newProd.desc,
          en: await translateText(newProd.desc, 'en'),
          ru: await translateText(newProd.desc, 'ru')
       };
    }

    const pData = {
      name: finalName,
      price: parseFloat(newProd.price),
      category: newProd.category,
      color: newProd.color,
      desc: finalDesc,
      img: finalImageUrl,
    };
    
    if (newProd.oldPrice) pData.oldPrice = parseFloat(newProd.oldPrice);
    else pData.oldPrice = null;
    
    if (newProd.badge) {
      pData.badge = newProd.badge;
      pData.badgeType = newProd.badgeType;
    } else {
      pData.badge = null;
      pData.badgeType = null;
    }

    return pData;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      alert('Zəhmət olmasa ən azı ad və qiyməti daxil edin.');
      return;
    }
    if (!imageFile && !newProd.img && !editingId) {
      alert('Zəhmət olmasa məhsulun şəklini yükləyin (yeni məhsul üçün).');
      return;
    }

    setIsUploading(true);
    try {
      const dataToSave = await generateProductData();
      let success;
      if (editingId) {
        success = await editProduct(editingId, dataToSave);
        if(success) alert('Məhsul uğurla redaktə edildi!');
      } else {
        success = await addProduct({ ...dataToSave, featured: false });
        // alert handled in useProducts actually
      }

      if (success) closeForm();
    } catch (error) {
      console.error('Qeyd edərkən xəta:', error);
      alert('Xəta baş verdi!');
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (product) => {
    setNewProd({
      name: product.name || '',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      category: product.category || 'roses',
      color: product.color || 'all',
      desc: product.desc || '',
      img: product.img || '',
      badge: product.badge || '',
      badgeType: product.badgeType || 'new'
    });
    setEditingId(product.id);
    setImageFile(null);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewProd(initialProdState);
    setImageFile(null);
  };

  // Sıralama (Input)
  const handleOrderChange = async (oldIndex, newOrderValue) => {
    let newIndex = parseInt(newOrderValue) - 1; // İstifadəçi "1" yazırsa, arrayda "0" olmalıdır
    
    // Yoxlamalar
    if (isNaN(newIndex) || newIndex < 0) newIndex = 0;
    if (newIndex >= products.length) newIndex = products.length - 1;
    if (oldIndex === newIndex) return;
    
    // Array kopyasını al
    const newArray = [...products];
    
    // Köhnə yerdən kəs (çıxart)
    const [movedItem] = newArray.splice(oldIndex, 1);
    
    // Yeni yerə yapışdır (əlavə et)
    newArray.splice(newIndex, 0, movedItem);

    // Bütün siyahını Firebase-ə sırayla qeyd et
    await updateProductOrder(newArray);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-container-low)', padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: isMobile ? '32px 20px' : '40px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(56,69,50,0.1)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '8px' }}>Admin Girişi</h1>
          <p style={{ textAlign: 'center', color: 'var(--color-outline)', fontSize: '14px', marginBottom: '24px' }}>Xoş gəlmisiniz, zəhmət olmasa daxil olun.</p>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Şifrənizi daxil edin" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', marginBottom: '24px', fontSize: '16px', outline: 'none' }} />
            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Daxil Ol</button>
          </form>
        </div>
      </div>
    );
  }

  // Real-time filtered products
  const filteredProducts = catFilter === 'all' ? products : products.filter(p => p.category === catFilter);

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      
      {/* Mobile Top Header */}
      {isMobile && (
        <header style={{
          position: 'sticky', top: 0, left: 0, right: 0, height: '64px',
          backgroundColor: 'rgba(252, 249, 243, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-surface-container-high)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu color="var(--color-primary)" size={24} />
            </button>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>Velizade Admin</span>
          </div>
          <button onClick={handleLogout} style={{ color: 'var(--color-error)' }}><LogOut size={20} /></button>
        </header>
      )}

      {/* Sidebar / Drawer */}
      <div style={{ 
        width: isMobile ? '280px' : '260px', 
        height: '100vh',
        position: isMobile ? 'fixed' : 'static',
        top: 0, 
        left: isMobile ? (isSidebarOpen ? '0' : '-100%') : '0',
        zIndex: 150,
        backgroundColor: 'var(--color-surface-container-low)', 
        padding: '32px 20px', 
        borderRight: isMobile ? 'none' : '1px solid var(--color-surface-container-high)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isMobile ? '8px 0 32px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: 'bold', paddingLeft: '8px' }}>Velizade Admin</h2>
           {isMobile && <button onClick={() => setIsSidebarOpen(false)}><X size={24} color="var(--color-outline)" /></button>}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('products')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'products' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <Package size={20} /> Məhsullar
          </button>
          <button onClick={() => setActiveTab('orders')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <DollarSign size={20} /> Sifarişlər 
            {orders.filter(o=>o.status==='pending').length > 0 && <span style={{ marginLeft: 'auto', backgroundColor: 'var(--color-error)', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '12px' }}>{orders.filter(o=>o.status==='pending').length}</span>}
          </button>
          <button onClick={() => setActiveTab('analytics')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'analytics' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'analytics' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <BarChart2 size={20} /> Analitika
          </button>
          <button onClick={() => setActiveTab('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'settings' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <Settings size={20} /> Tənzimləmələr
          </button>

          <div style={{ margin: '16px 0', height: '1px', backgroundColor: 'var(--color-surface-container-highest)' }} />

          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--color-error)', borderRadius: '12px', fontWeight: 'bold' }}>
            <LogOut size={20} /> Çıxış Et
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 140, backdropFilter: 'blur(2px)' }} 
        />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: isMobile ? '24px 16px' : '40px', overflowX: 'hidden' }}>
          
          {activeTab === 'products' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Məhsullar ({filteredProducts.length})</h1>
                </div>
                <button onClick={() => { closeForm(); setShowAddForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'white', padding: '12px 24px', borderRadius: '9999px', fontWeight: 'bold' }}>
                  <Plus size={20} /> Yeni Əlavə Et
                </button>
              </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div style={{ backgroundColor: 'white', padding: isMobile ? '24px 16px' : '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '40px', position: 'relative' }}>
                <button onClick={closeForm} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--color-outline)' }}><X size={24} /></button>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>
                  {editingId ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Yarat'}
                </h2>
                <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Adı</label>
                    <input value={getAz(newProd.name)} onChange={e=>setNewProd({...newProd, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-secondary)' }}>Mövcud Qiyməti (AZN)</label>
                      <input type="number" step="0.1" value={newProd.price} onChange={e=>setNewProd({...newProd, price: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--color-secondary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-outline)' }}>Köhnə Qiyməti</label>
                      <input type="number" step="0.1" value={newProd.oldPrice} onChange={e=>setNewProd({...newProd, oldPrice: e.target.value})} placeholder="İstəyə bağlı" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Kateqoriya</label>
                    <select value={newProd.category} onChange={e=>setNewProd({...newProd, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Etiket</label>
                      <input value={newProd.badge} onChange={e=>setNewProd({...newProd, badge: e.target.value})} placeholder="Yazılmasa gizlənəcək" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Növü</label>
                       <select value={newProd.badgeType} onChange={e=>setNewProd({...newProd, badgeType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                         <option value="new">Yeni</option>
                         <option value="discount">Endirim</option>
                         <option value="limited">Limit.</option>
                       </select>
                    </div>
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Açıqlama</label>
                    <textarea value={getAz(newProd.desc)} onChange={e=>setNewProd({...newProd, desc: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }} />
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Şəkil Yüklə</label>
                     <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) setImageFile(e.target.files[0]); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }} />
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <button type="submit" disabled={isUploading} style={{ padding: '14px', backgroundColor: isUploading ? 'var(--color-outline)' : 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', width: '100%' }}>
                      {isUploading ? 'Yüklənir...' : (editingId ? 'Yadda Saxla' : 'Məhsul Yarat')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Data Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: isMobile ? '800px' : 'auto', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-container-low)', borderBottom: '2px solid var(--color-surface-container-high)' }}>
                  <tr>
                    <th style={{ padding: '16px', width: '60px', textAlign: 'center', color: 'var(--color-outline)' }}>Sıra No.</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>Məhsul</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>
                      <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer' }}>
                        <option value="all">Bütün Kateqoriyalar</option>
                        {categories.map(c => <option key={`f-${c.id}`} value={c.id}>{c.name}</option>)}
                      </select>
                    </th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>Qiymət</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)', textAlign: 'center' }}>Vitrində</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)', textAlign: 'right' }}>İdarə</th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>Güllər bazadan yüklənir...</td></tr>
                  ) : filteredProducts.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input 
                           type="number" 
                           key={`order-${p.id}-${i}`} // Key dəyişəndə input refresh olur, köhnə rəqəm ilişib qalmır
                           defaultValue={i + 1} 
                           onBlur={(e) => handleOrderChange(i, e.target.value)}
                           onKeyDown={(e) => { if(e.key === 'Enter') handleOrderChange(i, e.target.value); }}
                           style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                           min="1"
                           max={products.length}
                        />
                      </td>
                      <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-surface-container-low)', overflow: 'hidden' }}>
                           <img src={p.img} alt={getAz(p.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)', display: 'block' }}>{getAz(p.name)}</span>
                          {p.badge && <span style={{ padding: '2px 6px', backgroundColor: p.badgeType === 'discount' ? 'var(--color-error)' : 'var(--color-primary)', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>{p.badge}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)' }}>
                         {categories.find(c => c.id === p.category)?.name || p.category}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontWeight: 'bold' }}>{p.price} ₼</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button onClick={() => updateProductStatus(p.id, p.featured)} style={{ color: p.featured ? 'var(--color-secondary)' : 'var(--color-outline)' }}>
                          <Star fill={p.featured ? 'var(--color-secondary)' : 'none'} size={20} />
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => openEdit(p)} style={{ color: 'var(--color-primary)', padding: '8px' }}><Edit size={20} /></button>
                        <button onClick={() => { if(window.confirm('Əminsiniz?')) deleteProduct(p.id); }} style={{ color: 'var(--color-error)', padding: '8px', marginLeft: '8px' }}><Trash2 size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Gələn Sifarişlər</h1>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
               {ordersLoading ? (
                 <p>Yüklənir...</p>
               ) : orders.length === 0 ? (
                 <p>Hələ ki, yeni sifariş yoxdur.</p>
               ) : (
                 orders.map(order => (
                    <div key={order.firebaseId} className="admin-card-compact" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div className="admin-orders-header">
                          <div>
                             <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>#{order.id} • {new Date(order.createdAt).toLocaleString('az-AZ')}</span>
                             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{order.customer.name} <span style={{ color: 'var(--color-outline)', fontWeight: 'normal', fontSize: '14px' }}>({order.customer.phone})</span></h3>
                             <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>📍 {order.customer.address} ({order.customer.date} | {order.customer.time})</p>
                             {order.customer.note && <p style={{ fontSize: '14px', backgroundColor: 'var(--color-surface-container-lowest)', padding: '8px', borderRadius: '8px', marginTop: '8px', fontStyle: 'italic' }}>Qeyd: {order.customer.note}</p>}
                          </div>
                          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                             <div className="admin-metric-value" style={{ color: 'var(--color-secondary)' }}>{order.totalAmount} AZN</div>
                             <div style={{ fontSize: '12px', color: 'var(--color-outline)', marginTop: '4px' }}>Çatdırılma: {order.deliveryMethod} ({order.deliveryFee} AZN)</div>
                             
                             <div style={{ marginTop: '16px' }}>
                                {order.status === 'pending' ? (
                                  <button onClick={() => { if(window.confirm('Sifarişi təhvil verilmiş kimi işarələ?')) updateOrderStatus(order.firebaseId, 'completed'); }} style={{ padding: '8px 16px', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={16}/> Gözləyir (Təsdiqlə)</button>
                                ) : (
                                  <div style={{ padding: '8px 16px', backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-primary)', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: 0.6 }}><CheckCircle size={16}/> Tamamlanıb</div>
                                )}
                             </div>
                          </div>
                       </div>

                       {/* Items */}
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                          {order.items?.map(oItem => (
                            <div key={oItem.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-surface-container-lowest)', padding: '8px 12px', borderRadius: '12px' }}>
                              <img src={oItem.img} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{getAz(oItem.name)}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>{oItem.qty} ədəd x {oItem.price} AZN</div>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 ))
               )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          () => {
             // Tarixə görə süz (Filter by Date Range)
             const filteredOrders = orders.filter(order => {
                if (!analyticsDateRange.start && !analyticsDateRange.end) return true;
                const oDate = new Date(order.createdAt).getTime();
                let startValid = true;
                let endValid = true;
                if (analyticsDateRange.start) {
                   startValid = oDate >= new Date(analyticsDateRange.start).setHours(0,0,0,0);
                }
                if (analyticsDateRange.end) {
                   endValid = oDate <= new Date(analyticsDateRange.end).setHours(23,59,59,999);
                }
                return startValid && endValid;
             });

             // Hesablamalar (Real-Time Rendered)
             let totalRevenue = 0;
             let totalItemsSold = 0;
             const productStats = {}; // { id: { name, img, qty, revenue } }
             
             filteredOrders.forEach(order => {
                totalRevenue += (order.totalAmount || 0);
                order.items?.forEach(item => {
                   totalItemsSold += item.qty;
                   const pid = item.id;
                   if (!productStats[pid]) productStats[pid] = { name: item.name, img: item.img, qty: 0, revenue: 0 };
                   productStats[pid].qty += item.qty;
                   productStats[pid].revenue += (item.price * item.qty);
                });
             });

             const statsArray = Object.values(productStats);
             
             // Sorting Logic
             statsArray.sort((a,b) => {
               if (sortConfig.key === 'qty') return sortConfig.direction === 'asc' ? a.qty - b.qty : b.qty - a.qty;
               else return sortConfig.direction === 'asc' ? a.revenue - b.revenue : b.revenue - a.revenue;
             });

             const requestSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));

             return (
              <div style={{ maxWidth: '900px' }}>
                <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>Satış Statistikası</h1>
                
                {/* Date Filter */}
                <div className="admin-card-compact" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
                   <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-outline)', marginBottom: '4px' }}>Başlanğıc Tarixi</label>
                      <input type="date" value={analyticsDateRange.start} onChange={e => setAnalyticsDateRange({...analyticsDateRange, start: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', outline: 'none', color: 'var(--color-on-surface)' }} />
                   </div>
                   {!isMobile && <div style={{ padding: '0 8px', color: 'var(--color-outline)' }}>—</div>}
                   <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-outline)', marginBottom: '4px' }}>Bitiş Tarixi</label>
                      <input type="date" value={analyticsDateRange.end} onChange={e => setAnalyticsDateRange({...analyticsDateRange, end: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', outline: 'none', color: 'var(--color-on-surface)' }} />
                   </div>
                   {(analyticsDateRange.start || analyticsDateRange.end) && (
                      <button onClick={() => setAnalyticsDateRange({ start: '', end: '' })} style={{ padding: '10px 20px', backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-error)', fontWeight: 'bold', borderRadius: '8px' }}>
                         Sıfırla
                      </button>
                   )}
                </div>

                {/* 3 Metrics */}
                <div className="admin-grid-metrics" style={{ marginBottom: '32px' }}>
                  <div className="admin-metric-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'var(--color-outline)', fontSize: '12px', fontWeight: 'bold' }}>SATIŞ GƏLİRİ (AZN)</p>
                    <p className="admin-metric-value">{totalRevenue.toFixed(2)} ₼</p>
                  </div>
                  <div className="admin-metric-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'var(--color-outline)', fontSize: '12px', fontWeight: 'bold' }}>SİFARİŞ SAYI</p>
                    <p className="admin-metric-value">{filteredOrders.length}</p>
                  </div>
                  <div className="admin-metric-card" style={{ backgroundColor: 'var(--color-secondary)', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>TƏHVİL VERİLƏN</p>
                    <p className="admin-metric-value" style={{ color: 'white' }}>{totalItemsSold}</p>
                  </div>
                </div>

                {/* Performance Table */}
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>Məhsul Performansı</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-surface-container-low)', borderBottom: '2px solid var(--color-surface-container-high)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>Məhsulun Görüntüsü</th>
                        <th style={{ padding: '16px 24px', cursor: 'pointer' }} onClick={() => requestSort('qty')}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: sortConfig.key === 'qty' ? 'var(--color-primary)' : 'var(--color-outline)' }}>Satılma Sayı {sortConfig.key === 'qty' ? (sortConfig.direction === 'desc' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>) : ''}</div>
                        </th>
                        <th style={{ padding: '16px 24px', cursor: 'pointer' }} onClick={() => requestSort('revenue')}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: sortConfig.key === 'revenue' ? 'var(--color-primary)' : 'var(--color-outline)' }}>Məbləğ (AZN) {sortConfig.key === 'revenue' ? (sortConfig.direction === 'desc' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>) : ''}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsArray.length === 0 ? (
                        <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center' }}>Heç bir satış yoxdur.</td></tr>
                      ) : statsArray.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                          <td style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}><img src={p.img} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}>{getAz(p.name)}</span>
                          </td>
                          <td style={{ padding: '12px 24px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                             <span style={{ backgroundColor: 'var(--color-surface-container-lowest)', padding: '6px 12px', borderRadius: '9999px', fontSize: '13px' }}>{p.qty} Ədəd</span>
                          </td>
                          <td style={{ padding: '12px 24px', fontWeight: 'bold' }}>
                            <span style={{ fontSize: '16px' }}>{p.revenue} ₼</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
             );
          }
        )()}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Tənzimləmələr</h1>

            {/* Logo Section */}
            <div className="admin-card-compact" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '24px' }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-highest)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface-container)', flexShrink: 0 }}>
                  {siteLogo ? <img src={siteLogo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon color="var(--color-outline)" />}
               </div>
               <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>Mağaza Vitrin Loqosu</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-outline)', marginBottom: '16px' }}>Saytın hər yerində və kənarlarda görünəcək əsas loqo.</p>
                  <label style={{ padding: '10px 24px', backgroundColor: 'var(--color-secondary)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                     Şəkil Seç və Yüklə
                     <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
               </div>
            </div>

            {/* CMS Sections */}
            <div className="admin-card-compact" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>Hero Bölməsi Mətni</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-outline)', marginBottom: '16px' }}>Ana səhifədəki əsas tanıtım mətni (Bakının ən premium...)</p>
              <textarea 
                value={heroDesc} 
                onChange={e => setHeroDesc(e.target.value)} 
                placeholder="Mətni daxil edin..."
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', outline: 'none', minHeight: '120px', fontSize: '15px' }} 
              />
              <button 
                onClick={handleUpdateHeroDesc}
                style={{ marginTop: '16px', padding: '12px 32px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}
              >
                Mətni Yenilə
              </button>
            </div>

            <div className="admin-settings-grid">
              
              <div className="admin-card-compact">
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>Sistem Şifrəsini Yenilə</h2>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-outline)' }}>Köhnə Şifrə</label>
                    <input type="password" required value={passwordForm.old} onChange={e=>setPasswordForm({...passwordForm, old: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-surface-container-high)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-outline)' }}>Yeni Şifrə</label>
                    <input type="password" required value={passwordForm.new} onChange={e=>setPasswordForm({...passwordForm, new: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-primary-fixed)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-outline)' }}>Yeni Şifrə (Təkrar)</label>
                    <input type="password" required value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm, confirm: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-primary-fixed)', outline: 'none' }} />
                  </div>
                  <button type="submit" style={{ marginTop: '16px', padding: '14px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Şifrəni Dəyiş</button>
                </form>
              </div>

              <div className="admin-card-compact">
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>Yaradılmış Kateqoriyalar</h2>
                
                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {categories.map(c => (
                     <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high)', overflow: 'hidden', border: '1px solid var(--color-surface-container-highest)' }}>
                              {c.img ? <img src={c.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color="var(--color-outline)" style={{ margin: '8px' }}/>}
                           </div>
                           <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{c.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <label style={{ cursor: 'pointer', color: 'var(--color-secondary)' }} title="Kateqoriyanın şəklini dəyiş">
                              <ImageIcon size={16} />
                              <input type="file" accept="image/*" onChange={(e) => handleCategoryImgUpload(c.id, e.target.files[0])} style={{ display: 'none' }} />
                           </label>
                           <button onClick={() => handleDeleteCategory(c.id)} title="Katqoriyanı sil" style={{ color: 'var(--color-error)' }}><Trash2 size={16}/></button>
                        </div>
                     </div>
                  ))}
                </div>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px' }}>
                  <input required placeholder="Ad yazın" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-primary-fixed)', outline: 'none', fontSize: '13px' }} />
                  <button type="submit" style={{ padding: '0 16px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>+</button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
