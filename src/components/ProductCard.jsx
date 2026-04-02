import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';

function ProductCard({ product, style }) {
  const navigate = useNavigate();
  const { toggle, isLiked } = useWishlist();
  const { addToCart } = useCart();
  const { t, getLoc } = useLocale();
  const liked = isLiked(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggle(product.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    // Simple toast or alert
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'var(--clr-green)';
    toast.style.color = 'var(--clr-rose)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = 10000;
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    toast.innerText = t('added', 'Səbətə əlavə edildi!');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div 
      onClick={handleCardClick}
      style={{ 
        ...style, 
        cursor: 'pointer', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)'
      }}
      className="product-card-hover"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.borderColor = 'rgba(212,191,126,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--clr-border)';
      }}
    >
      {/* Image container */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        backgroundColor: 'var(--clr-surface2)',
        overflow: 'hidden'
      }}>
        <img 
          src={product.img} 
          alt={getLoc(product.name)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s ease' }}
        />

        {/* Badges */}
        {product.badge && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 10,
            backgroundColor: product.badgeType === 'new' ? 'var(--clr-green)' : 'var(--clr-rose)',
            color: product.badgeType === 'new' ? 'var(--clr-rose)' : '#1a1e14',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {product.badge}
          </div>
        )}

        {/* Favorite */}
        <button 
          onClick={handleLike}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 10,
            width: '34px', height: '34px', borderRadius: '50%',
            backgroundColor: liked ? 'var(--clr-green)' : 'rgba(14,11,15,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: liked ? 'var(--clr-rose)' : 'var(--clr-white)',
            transition: 'background var(--transition), transform var(--transition)'
          }}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '15.5px', fontWeight: '600', color: 'var(--clr-text)', marginBottom: '6px', lineHeight: '1.4' }}>
          {getLoc(product.name)}
        </h3>
        <p style={{ 
          fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '14px', 
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
          overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '36px',
          flex: 1
        }}>
          {getLoc(product.desc)}
        </p>

        {/* Pricing & Add to cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--clr-rose-lt)' }}>{product.price} AZN</span>
             {product.oldPrice && (
               <span style={{ fontSize: '13px', color: 'var(--clr-muted)', textDecoration: 'line-through' }}>
                 {product.oldPrice} AZN
               </span>
             )}
          </div>
          <button 
            onClick={handleAddToCart}
            style={{
              width: '40px', height: '40px', borderRadius: '8px',
              backgroundColor: 'var(--clr-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--clr-rose)', transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-green-lt)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-green)'}
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
