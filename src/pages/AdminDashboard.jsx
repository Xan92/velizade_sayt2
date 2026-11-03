import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../config/imageUtils';
import { Link } from 'react-router-dom';
import { Package, Plus, Trash2, Edit, Star, DollarSign, X, CheckCircle, Settings, LogOut, BarChart2, XCircle, Eye, EyeOff, Store, Phone, MessageCircle, RotateCcw, Search, Tag } from 'lucide-react';

const slugify = (text) => text.toLowerCase()
  .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
  .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Telefon fotoları yüklənməzdən əvvəl kiçildilir, sayt ağırlaşmasın
const compressImage = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      URL.revokeObjectURL(url);
      resolve(blob || file);
    }, 'image/webp', 0.8);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    resolve(file);
  };
  img.src = url;
});

const whatsappNumber = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('994') ? digits : `994${digits.replace(/^0/, '')}`;
};

function AdminDashboard() {
  const { products, loading: productsLoading, deleteProduct, updateProductStatus, addProduct, editProduct, updateProductOrder } = useProducts({ showInactive: true });
  const { isAdmin, loading: profileLoading } = useAuth();
  const { orders, loading: ordersLoading, updateOrderStatus, refreshOrders } = useOrders({ enabled: isAdmin });

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAz = (str) => {
    if (!str) return '';
    if (typeof str === 'object') return str.az || '';
    return str;
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initialProdState = { name: '', nameEn: '', nameRu: '', price: '', oldPrice: '', category: 'bouquets', color: 'all', desc: '', descEn: '', descRu: '', img: '', badge: '', badgeType: 'new' };
  const [newProd, setNewProd] = useState(initialProdState);
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [noPriceOnly, setNoPriceOnly] = useState(false);
  const [orderFilter, setOrderFilter] = useState('pending');
  const [promos, setPromos] = useState([]);
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '', days: '7' });
  const [heroDesc, setHeroDesc] = useState('');
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    if (!session) return;
    const fetchAdminData = async () => {
      const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
      if (catData) setCategories(catData);

      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings) {
        const hero = settings.find(s => s.key === 'hero_desc');
        if (hero) setHeroDesc(hero.value);
        const about = settings.find(s => s.key === 'about_text');
        if (about) setAboutText(about.value);
      }
    };
    fetchAdminData();
  }, [session]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'promos') return;
    supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) alert('Promokodlar yüklənmədi: ' + error.message);
        else setPromos(data || []);
      });
  }, [isAdmin, activeTab]);

  const handleAddPromo = async (e) => {
    e.preventDefault();
    const code = promoForm.code.trim().toUpperCase();
    const value = parseFloat(promoForm.value);
    const days = parseInt(promoForm.days, 10);
    if (!/^[A-Z0-9]{3,30}$/.test(code)) return alert('Kod 3-30 simvol olmalıdır: yalnız hərf (A-Z) və rəqəm.');
    if (!(value > 0) || (promoForm.type === 'percent' && value > 100)) return alert('Endirimi düzgün yazın.');
    if (promoForm.days !== '' && !(days > 0)) return alert('Gün sayını düzgün yazın və ya müddətsiz üçün boş saxlayın.');

    const row = {
      code,
      discount_percent: promoForm.type === 'percent' ? value : null,
      discount_fixed: promoForm.type === 'fixed' ? value : null,
      active: true,
      expires_at: promoForm.days === '' ? null : new Date(Date.now() + days * 86400000).toISOString()
    };
    const { data, error } = await supabase.from('promo_codes').insert([row]).select().single();
    if (error) return alert(error.code === '23505' ? 'Bu kod artıq var.' : 'Xəta: ' + error.message);
    setPromos(prev => [data, ...prev]);
    setPromoForm({ code: '', type: 'percent', value: '', days: '7' });
  };

  const handleTogglePromo = async (promo) => {
    const { error } = await supabase.from('promo_codes').update({ active: !promo.active }).eq('code', promo.code);
    if (error) return alert('Xəta: ' + error.message);
    setPromos(prev => prev.map(p => p.code === promo.code ? { ...p, active: !p.active } : p));
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`${promo.code} kodu silinsin?`)) return;
    const { error } = await supabase.from('promo_codes').delete().eq('code', promo.code);
    if (error) return alert('Xəta: ' + error.message);
    setPromos(prev => prev.filter(p => p.code !== promo.code));
  };

  const promoStatus = (promo) => {
    if (!promo.active) return ['Söndürülüb', 'var(--color-outline)'];
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return ['Vaxtı bitib', 'var(--color-error)'];
    return ['Aktiv', 'var(--color-primary)'];
  };

  const notifyResult = (ok) => {
    if (!ok) alert('Əməliyyat alınmadı. İnterneti və icazələri yoxlayıb yenidən cəhd edin.');
  };

  const handlePriceSave = async (product, rawValue) => {
    const value = rawValue.trim() === '' ? null : parseFloat(rawValue);
    if (value !== null && (isNaN(value) || value < 0)) return alert('Qiyməti düzgün yazın.');
    if (value === product.price) return;
    notifyResult(await editProduct(product.id, { price: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
    } catch (err) {
      setLoginError(err.message || 'Giriş məlumatları yanlışdır.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if(!newCatName) return;
    const key = (newCatId || newCatName).toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!key) return alert('Düzgün ID daxil edin!');

    try {
      const { data, error } = await supabase.from('categories').insert([{ id: key, name: newCatName }]).select().single();
      if (error) throw error;
      setCategories(prev => [...prev, data]);
      setNewCatName('');
      setNewCatId('');
    } catch(err) {
      alert('Xəta: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if(!window.confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', catId);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch(err) {
      alert('Xəta: ' + err.message);
    }
  };

  const handleSaveSetting = async (key, value) => {
    try {
      const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      alert('Uğurla yadda saxlanıldı!');
    } catch(err) {
      alert('Xəta: ' + err.message);
    }
  };
    const handleImageFileChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const upload = await compressImage(file);
      const fileExt = upload.type === 'image/webp' ? 'webp' : file.name.split('.').pop();
      const baseName = slugify(newProd.name) || 'aliza-flowers-gul';
      const filePath = `${baseName}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, upload, {
          cacheControl: '31536000',
          contentType: upload.type || file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setNewProd(prev => ({ ...prev, img: publicUrl }));
    } catch (error) {
      alert('Şəkil yüklənərkən xəta baş verdi: ' + error.message);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  // Boş tərcümələr saxlanmır, sayt onda azərbaycanca mətni göstərir
  const localized = (az, en, ru) => ({ az, ...(en.trim() && { en }), ...(ru.trim() && { ru }) });

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name.trim()) return alert('Məhsulun adını yazın.');
    if (!editingId && !newProd.img) return alert('Məhsulun şəklini seçin.');

    setIsUploading(true);
    try {
      const pData = {
        name: localized(newProd.name, newProd.nameEn, newProd.nameRu),
        desc: localized(newProd.desc, newProd.descEn, newProd.descRu),
        price: newProd.price === '' ? null : parseFloat(newProd.price),
        oldPrice: newProd.oldPrice ? parseFloat(newProd.oldPrice) : null,
        category: newProd.category,
        color: newProd.color || 'all',
        img: newProd.img || '',
        badge: newProd.badge || null,
        badgeType: newProd.badge ? newProd.badgeType : null
      };

      let success;
      if (editingId) {
        success = await editProduct(editingId, pData);
      } else {
        success = await addProduct({ ...pData, active: true, featured: false, order: products.length + 1 });
      }

      if (success) closeForm();
      else alert('Məhsul yadda saxlanılmadı. İcazələri və məlumatları yoxlayın.');
    } catch (error) {
      alert('Xəta baş verdi: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (product) => {
    setNewProd({
      name: getAz(product.name),
      nameEn: product.name?.en || '',
      nameRu: product.name?.ru || '',
      descEn: product.desc?.en || '',
      descRu: product.desc?.ru || '',
      price: product.price ?? '',
      oldPrice: product.oldPrice || '',
      category: product.category || 'bouquets',
      color: product.color || 'all',
      desc: getAz(product.desc),
      img: product.img || '',
      badge: product.badge || '',
      badgeType: product.badgeType || 'new'
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewProd(initialProdState);
  };

  const handleOrderChange = async (filteredIndex, newOrderValue, filteredList) => {
    const product = filteredList[filteredIndex];
    if (!product) return;

    let targetIndex = parseInt(newOrderValue) - 1;
    if (isNaN(targetIndex) || targetIndex < 0) targetIndex = 0;
    if (targetIndex >= filteredList.length) targetIndex = filteredList.length - 1;
    if (filteredIndex === targetIndex) return;

    const newArray = [...products];
    const oldIdx = newArray.findIndex(p => p.id === product.id);
    const targetItem = filteredList[targetIndex];
    const newIdx = newArray.findIndex(p => p.id === targetItem.id);

    const [moved] = newArray.splice(oldIdx, 1);
    newArray.splice(newIdx, 0, moved);

    await updateProductOrder(newArray);
  };

  if (authLoading || (session && profileLoading)) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yüklənir...</div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-container-low)', padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '40px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(56,69,50,0.1)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '8px' }}>Aliza Admin</h1>
          <p style={{ textAlign: 'center', color: 'var(--color-outline)', fontSize: '14px', marginBottom: '24px' }}>Supabase admin hesabınızla daxil olun</p>
          {loginError && <div style={{ color: 'var(--color-error)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', fontSize: '15px', outline: 'none' }} />
            <input type="password" placeholder="Şifrə" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', fontSize: '15px', outline: 'none' }} />
            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Daxil Ol</button>
          </form>
        </div>
      </div>
    );
  }

  // Qeydiyyatdan keçmiş adi müştəri admin panelə girə bilməz
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Bu səhifəyə icazəniz yoxdur</h1>
        <button onClick={handleLogout} style={{ padding: '12px 24px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Çıxış Et</button>
      </div>
    );
  }

  const searchText = productSearch.trim().toLowerCase();
  const filteredProducts = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (noPriceOnly && p.price != null) return false;
    return !searchText || getAz(p.name).toLowerCase().includes(searchText);
  });
  const noPriceCount = products.filter(p => p.price == null).length;
  const featuredCount = products.filter(p => p.featured).length;
  const visibleOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const orderTabs = [
    ['pending', 'Gözləyən'],
    ['completed', 'Tamamlanan'],
    ['rejected', 'İmtina'],
    ['all', 'Hamısı'],
  ];

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>

      {/* Sidebar */}
      <div className="admin-sidebar" style={{
        width: '260px',
        backgroundColor: 'var(--color-surface-container-low)',
        padding: '32px 20px',
        borderRight: '1px solid var(--color-surface-container-high)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontWeight: 'bold' }}>Aliza Admin</h2>
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
          <button onClick={() => setActiveTab('promos')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'promos' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'promos' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <Tag size={20} /> Promokodlar
          </button>
          <button onClick={() => setActiveTab('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'settings' ? 'white' : 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold' }}>
            <Settings size={20} /> Tənzimləmələr
          </button>

          <div style={{ margin: '16px 0', height: '1px', backgroundColor: 'var(--color-surface-container-highest)' }} />

          <Link to="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--color-on-surface)', borderRadius: '12px', fontWeight: 'bold', fontSize: '13.33px' }}>
            <Store size={20} /> Sayta Keç
          </Link>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--color-error)', borderRadius: '12px', fontWeight: 'bold' }}>
            <LogOut size={20} /> Çıxış Et
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main" style={{ flex: 1, minWidth: 0, padding: '40px', overflowX: 'hidden' }}>

          {activeTab === 'products' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Məhsullar ({filteredProducts.length})</h1>
                <button onClick={() => { closeForm(); setShowAddForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'white', padding: '12px 24px', borderRadius: '9999px', fontWeight: 'bold' }}>
                  <Plus size={20} /> Yeni Əlavə Et
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Məhsul axtar..." aria-label="Məhsul axtar" style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '9999px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'white', outline: 'none' }} />
                </div>
                <button onClick={() => setNoPriceOnly(v => !v)} aria-pressed={noPriceOnly} style={{ padding: '10px 18px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '13px', border: '1px solid var(--color-error)', backgroundColor: noPriceOnly ? 'var(--color-error)' : 'transparent', color: noPriceOnly ? 'white' : 'var(--color-error)' }}>
                  Qiyməti olmayan ({noPriceCount})
                </button>
                <span style={{ fontSize: '13px', color: 'var(--color-outline)' }}>Ana səhifədə ulduzlu ilk 8 məhsul görünür (indi: {featuredCount})</span>
              </div>

            {showAddForm && (
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '40px', position: 'relative' }}>
                <button onClick={closeForm} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--color-outline)' }}><X size={24} /></button>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>
                  {editingId ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Yarat'}
                </h2>
                <form className="admin-product-form" onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Adı</label>
                    <input value={newProd.name} onChange={e=>setNewProd({...newProd, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} required />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-secondary)' }}>Qiyməti (AZN)</label>
                      <input type="number" step="0.01" min="0" placeholder="Boş: WhatsApp ilə" value={newProd.price} onChange={e=>setNewProd({...newProd, price: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--color-secondary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-outline)' }}>Köhnə Qiyməti</label>
                      <input type="number" step="0.01" min="0" value={newProd.oldPrice} onChange={e=>setNewProd({...newProd, oldPrice: e.target.value})} placeholder="İstəyə bağlı" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Adı (EN, istəyə bağlı)</label>
                    <input value={newProd.nameEn} onChange={e=>setNewProd({...newProd, nameEn: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Adı (RU, istəyə bağlı)</label>
                    <input value={newProd.nameRu} onChange={e=>setNewProd({...newProd, nameRu: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
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
                      <input value={newProd.badge} onChange={e=>setNewProd({...newProd, badge: e.target.value})} placeholder="Məs: Yeni, Endirim" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Növü</label>
                       <select value={newProd.badgeType} onChange={e=>setNewProd({...newProd, badgeType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                         <option value="new">Yeni</option>
                         <option value="sale">Endirim</option>
                       </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Rəng (filtr üçün)</label>
                    <select value={newProd.color} onChange={e=>setNewProd({...newProd, color: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="all">Qarışıq</option>
                      <option value="red">Qırmızı</option>
                      <option value="pink">Çəhrayı</option>
                      <option value="white">Ağ</option>
                      <option value="yellow">Sarı</option>
                      <option value="purple">Bənövşəyi</option>
                      <option value="orange">Narıncı</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Açıqlama</label>
                    <textarea value={newProd.desc} onChange={e=>setNewProd({...newProd, desc: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Açıqlama (EN, istəyə bağlı)</label>
                    <textarea value={newProd.descEn} onChange={e=>setNewProd({...newProd, descEn: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '70px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Açıqlama (RU, istəyə bağlı)</label>
                    <textarea value={newProd.descRu} onChange={e=>setNewProd({...newProd, descRu: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '70px' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Məhsulun Şəkli (əvvəlcə adı yazın: fayl adı ondan yaranır, şəkil avtomatik kiçildilir)
                    </label>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageFileChange}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f9f9f9',
                          flex: 1,
                          cursor: 'pointer'
                        }}
                      />
                      {isUploading && (
                        <span style={{ fontSize: '13px', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                          Yüklənir...
                        </span>
                      )}
                    </div>

                    {newProd.img && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '8px' }}>
                        <img
                          src={getAssetUrl(newProd.img)}
                          alt="Önbaxış"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold', display: 'block' }}>✓ Şəkil hazırdır</span>
                          <span style={{ fontSize: '11px', color: '#666', wordBreak: 'break-all' }}>{newProd.img}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" disabled={isUploading} style={{ padding: '14px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontWeight: 'bold', width: '100%' }}>
                      {isUploading ? 'Yadda saxlanılır...' : (editingId ? 'Yadda Saxla' : 'Məhsul Yarat')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-container-low)', borderBottom: '2px solid var(--color-surface-container-high)' }}>
                  <tr>
                    <th style={{ padding: '16px', width: '60px', textAlign: 'center', color: 'var(--color-outline)' }}>Sıra</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>Məhsul</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>
                      <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer' }}>
                        <option value="all">Bütün Kateqoriyalar</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)' }}>Qiymət</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)', textAlign: 'center' }}>Vitrində</th>
                    <th style={{ padding: '16px 24px', color: 'var(--color-outline)', textAlign: 'right' }}>İdarə</th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>Yüklənir...</td></tr>
                  ) : filteredProducts.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)', opacity: p.active === false ? 0.5 : 1 }}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                           key={`${p.id}-${i}`}
                           type="number"
                           defaultValue={i + 1}
                           onBlur={(e) => handleOrderChange(i, e.target.value, filteredProducts)}
                           style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--color-surface-container-low)', overflow: 'hidden' }}>
                           <img src={getAssetUrl(p.img)} alt={getAz(p.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)', display: 'block' }}>{getAz(p.name)}</span>
                          {p.badge && <span style={{ padding: '2px 6px', backgroundColor: p.badgeType === 'sale' ? 'var(--color-error)' : 'var(--color-primary)', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{p.badge}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)' }}>
                         {categories.find(c => c.id === p.category)?.name || p.category}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <input
                          key={`price-${p.id}-${p.price}`}
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={p.price ?? ''}
                          placeholder="Qiymət"
                          aria-label={`${getAz(p.name)} qiyməti`}
                          onBlur={(e) => handlePriceSave(p, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                          style={{ width: '90px', padding: '8px', borderRadius: '8px', fontWeight: 'bold', border: p.price == null ? '2px solid var(--color-error)' : '1px solid var(--color-outline-variant)' }}
                        /> <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>AZN</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button onClick={async () => notifyResult(await updateProductStatus(p.id, p.featured))} aria-label="Ana səhifə vitrini" title="Ana səhifə vitrini" style={{ color: p.featured ? 'var(--color-secondary)' : 'var(--color-outline)' }}>
                          <Star fill={p.featured ? 'var(--color-secondary)' : 'none'} size={20} />
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={async () => notifyResult(await editProduct(p.id, { active: p.active === false }))} aria-label={p.active === false ? 'Saytda göstər' : 'Saytda gizlət'} title={p.active === false ? 'Saytda göstər' : 'Saytda gizlət'} style={{ color: 'var(--color-outline)', padding: '8px' }}>{p.active === false ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        <button onClick={() => { openEdit(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Redaktə et" title="Redaktə et" style={{ color: 'var(--color-primary)', padding: '8px' }}><Edit size={20} /></button>
                        <button onClick={async () => { if(window.confirm('Məhsul həmişəlik silinsin? Müvəqqəti üçün göz işarəsi ilə gizlədin.')) notifyResult(await deleteProduct(p.id)); }} aria-label="Sil" title="Sil" style={{ color: 'var(--color-error)', padding: '8px' }}><Trash2 size={20} /></button>
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
              <button onClick={refreshOrders} style={{ padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--color-outline-variant)', fontWeight: 'bold', fontSize: '13px' }}>Yenilə</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {orderTabs.map(([id, label]) => (
                <button key={id} onClick={() => setOrderFilter(id)} aria-pressed={orderFilter === id} style={{ padding: '8px 16px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '13px', backgroundColor: orderFilter === id ? 'var(--color-primary)' : 'var(--color-surface-container)', color: orderFilter === id ? 'white' : 'var(--color-on-surface)' }}>
                  {label} ({id === 'all' ? orders.length : orders.filter(o => o.status === id).length})
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
               {ordersLoading ? (
                 <p>Yüklənir...</p>
               ) : visibleOrders.length === 0 ? (
                 <p>Bu bölmədə sifariş yoxdur.</p>
               ) : (
                 visibleOrders.map(order => (
                    <div key={order.supabaseId} className="admin-card-compact" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div className="admin-orders-header">
                          <div>
                             <span style={{ fontSize: '12px', color: 'var(--color-outline)' }}>#{String(order.supabaseId).slice(0, 8).toUpperCase()} •  {new Date(order.createdAt).toLocaleString('az-AZ')}</span>
                             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{order.customer.name} </h3>
                             <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                               <a href={`tel:${order.customer.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}><Phone size={14} /> {order.customer.phone}</a>
                               <a href={`https://wa.me/${whatsappNumber(order.customer.phone)}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}><MessageCircle size={14} /> WhatsApp</a>
                             </div>
                             <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>📍 {order.customer.address} ({order.customer.date} | {order.customer.time})</p>
                             {order.customer.note && <p style={{ fontSize: '14px', backgroundColor: 'var(--color-surface-container-lowest)', padding: '8px', borderRadius: '8px', marginTop: '8px', fontStyle: 'italic' }}>Qeyd: {order.customer.note}</p>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <div className="admin-metric-value" style={{ color: 'var(--color-secondary)' }}>{order.totalAmount} AZN</div>
                             <div style={{ fontSize: '12px', color: 'var(--color-outline)', marginTop: '4px' }}>Çatdırılma: {order.deliveryMethod}</div>

                             <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                {order.status === 'pending' ? (
                                  <>
                                    <button onClick={async () => notifyResult(await updateOrderStatus(order.supabaseId, 'completed'))} style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16}/> Tamamla</button>
                                    <button onClick={async () => { if (window.confirm('Sifariş rədd edilsin?')) notifyResult(await updateOrderStatus(order.supabaseId, 'rejected')); }} style={{ padding: '8px 16px', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><XCircle size={16}/> İmtina Et</button>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ padding: '8px 16px', backgroundColor: 'var(--color-surface-container-low)', color: order.status === 'completed' ? 'var(--color-primary)' : 'var(--color-error)', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold' }}>
                                      {order.status === 'completed' ? 'Tamamlanıb' : 'İmtina Edilib'}
                                    </div>
                                    <button onClick={async () => notifyResult(await updateOrderStatus(order.supabaseId, 'pending'))} aria-label="Gözləyənə qaytar" title="Gözləyənə qaytar" style={{ padding: '8px', color: 'var(--color-outline)' }}><RotateCcw size={16} /></button>
                                  </>
                                )}
                             </div>
                          </div>
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                          {order.items?.map((oItem, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-surface-container-lowest)', padding: '8px 12px', borderRadius: '12px' }}>
                              <img src={getAssetUrl(oItem.img)} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
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
             const completedOrders = orders.filter(o => o.status === 'completed');
             let totalRevenue = 0;
             let totalItems = 0;
             completedOrders.forEach(o => {
               totalRevenue += o.totalAmount;
               o.items?.forEach(i => { totalItems += i.qty; });
             });

             return (
              <div style={{ maxWidth: '900px' }}>
                <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>Satış Statistikası</h1>

                <div className="admin-grid-metrics" style={{ marginBottom: '32px' }}>
                  <div className="admin-metric-card">
                    <p style={{ color: 'var(--color-outline)', fontSize: '12px', fontWeight: 'bold' }}>SATIŞ GƏLİRİ (AZN)</p>
                    <p className="admin-metric-value">{totalRevenue.toFixed(2)} AZN</p>
                  </div>
                  <div className="admin-metric-card">
                    <p style={{ color: 'var(--color-outline)', fontSize: '12px', fontWeight: 'bold' }}>SİFARİŞ SAYI</p>
                    <p className="admin-metric-value">{completedOrders.length}</p>
                  </div>
                  <div className="admin-metric-card" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <p style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>SATILAN MƏHSUL</p>
                    <p className="admin-metric-value" style={{ color: 'white' }}>{totalItems}</p>
                  </div>
                </div>
              </div>
             );
          }
        )()}

        {activeTab === 'promos' && (
          <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Promokodlar</h1>

            <form onSubmit={handleAddPromo} className="admin-card-compact" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '2 1 180px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Kod (müştəriyə verəcəyiniz söz)</label>
                <input required value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="Məs: NOVRUZ15" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', textTransform: 'uppercase' }} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Endirim növü</label>
                <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="percent">Faiz (%)</option>
                  <option value="fixed">Məbləğ (AZN)</option>
                </select>
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Endirim</label>
                <input required type="number" min="0.01" step="0.01" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} placeholder={promoForm.type === 'percent' ? '10' : '20'} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Neçə gün aktiv</label>
                <input type="number" min="1" step="1" value={promoForm.days} onChange={e => setPromoForm({ ...promoForm, days: e.target.value })} placeholder="Boş: müddətsiz" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              </div>
              <button type="submit" style={{ padding: '11px 24px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Yarat</button>
            </form>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                  <tr>
                    {['Kod', 'Endirim', 'Bitmə vaxtı', 'İstifadə', 'Status', ''].map(h => <th key={h} style={{ padding: '12px 16px', color: 'var(--color-outline)' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-outline)' }}>Hələ promokod yoxdur.</td></tr>
                  ) : promos.map(promo => {
                    const [statusText, statusColor] = promoStatus(promo);
                    const used = orders.filter(o => (o.customer.note || '').includes(`[Promokod: ${promo.code}]`)).length;
                    return (
                      <tr key={promo.code} style={{ borderTop: '1px solid var(--color-surface-container-highest)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', letterSpacing: '0.05em' }}>{promo.code}</td>
                        <td style={{ padding: '12px 16px' }}>{promo.discount_percent != null ? `${promo.discount_percent}%` : `${promo.discount_fixed} AZN`}</td>
                        <td style={{ padding: '12px 16px' }}>{promo.expires_at ? new Date(promo.expires_at).toLocaleString('az-AZ', { dateStyle: 'short', timeStyle: 'short' }) : 'Müddətsiz'}</td>
                        <td style={{ padding: '12px 16px' }}>{used} sifariş</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: statusColor }}>{statusText}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => handleTogglePromo(promo)} style={{ padding: '6px 14px', borderRadius: '9999px', border: '1px solid var(--color-outline-variant)', fontWeight: 'bold', fontSize: '12px' }}>{promo.active ? 'Söndür' : 'Aktiv et'}</button>
                          <button onClick={() => handleDeletePromo(promo)} aria-label={`${promo.code} sil`} style={{ color: 'var(--color-error)', padding: '6px', marginLeft: '6px' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-outline)' }}>"İstifadə" sütunu bu promokodla verilmiş bütün sifarişləri sayır. Vaxtı bitmiş və ya söndürülmüş kod saytda qəbul olunmur.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>Tənzimləmələr</h1>

            <div className="admin-card-compact">
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>Hero Bölməsi Mətni</h2>
              <textarea
                value={heroDesc}
                onChange={e => setHeroDesc(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', outline: 'none', minHeight: '100px' }}
              />
              <button onClick={() => handleSaveSetting('hero_desc', heroDesc)} style={{ marginTop: '16px', padding: '12px 32px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>
                Yadda Saxla
              </button>
            </div>

            <div className="admin-card-compact">
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>Haqqımızda Mətni</h2>
              <textarea
                value={aboutText}
                onChange={e => setAboutText(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-surface-container-high)', outline: 'none', minHeight: '100px' }}
              />
              <button onClick={() => handleSaveSetting('about_text', aboutText)} style={{ marginTop: '16px', padding: '12px 32px', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>
                Yadda Saxla
              </button>
            </div>

            <div className="admin-card-compact">
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '24px' }}>Kateqoriyalar</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {categories.map(c => (
                   <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{c.name} ({c.id})</span>
                      <button onClick={() => handleDeleteCategory(c.id)} style={{ color: 'var(--color-error)' }}><Trash2 size={16}/></button>
                   </div>
                ))}
              </div>

              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px' }}>
                <input required placeholder="Kateqoriya adı (məs: Qutular)" value={newCatName} onChange={e=>setNewCatName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }} />
                <button type="submit" style={{ padding: '0 20px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>Əlavə et</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;