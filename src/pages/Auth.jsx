import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        const { session } = await signupWithEmail(email, password, fullName);
        // Email təsdiqi tələb olunursa sessiya yoxdur: müştəriyə xəbər veririk
        if (!session) {
          setInfoMsg('Qeydiyyat tamamlandı. Hesabı aktivləşdirmək üçün emailinizə göndərilən linki açın.');
          return;
        }
      }
      navigate('/profile');
    } catch (err) {
      setErrorMsg(err.message || 'Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--clr-bg)', padding: '24px' }}>
      <div style={{
        backgroundColor: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', color: 'var(--clr-white)', marginBottom: '8px' }}>
            {isLogin ? 'Xoş Gəlmisiniz' : 'Hesab Yaradın'}
          </h1>
          <p style={{ color: 'var(--clr-muted)', fontSize: '14px' }}>
            {isLogin ? 'Aliza Flowers profilinizə daxil olun' : 'Premium çiçək təcrübəsi üçün qeydiyyatdan keçin'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--clr-surface2)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
              backgroundColor: isLogin ? 'var(--clr-green)' : 'transparent',
              color: isLogin ? 'var(--clr-white)' : 'var(--clr-muted)',
              transition: 'var(--transition)'
            }}
          >
            Daxil Ol
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
              backgroundColor: !isLogin ? 'var(--clr-green)' : 'transparent',
              color: !isLogin ? 'var(--clr-white)' : 'var(--clr-muted)',
              transition: 'var(--transition)'
            }}
          >
            Qeydiyyat
          </button>
        </div>

        {infoMsg && (
          <div role="status" style={{ backgroundColor: 'rgba(107,117,84,0.25)', border: '1px solid var(--clr-green)', color: 'var(--clr-rose-lt)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {infoMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(186,26,26,0.15)', border: '1px solid var(--color-error)', color: '#ff8585', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }} />
              <input
                type="text"
                placeholder="Ad və Soyadınız"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }} />
            <input
              type="email"
              placeholder="Email ünvanınız"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }} />
            <input
              type="password"
              placeholder="Şifrəniz (min. 6 simvol)"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid var(--clr-border)', backgroundColor: '#283220', color: 'var(--clr-text)', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '50px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? 'Yoxlanılır...' : (isLogin ? 'Daxil Ol' : 'Hesab Yarat')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--clr-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--clr-muted)' }}>VƏ YA</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--clr-border)' }} />
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          style={{
            width: '100%', padding: '12px', borderRadius: '50px',
            backgroundColor: 'var(--clr-surface2)', border: '1px solid var(--clr-border)',
            color: 'var(--clr-white)', fontWeight: '600', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            transition: 'var(--transition)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google ilə davam et
        </button>
      </div>
    </div>
  );
}

export default Auth;