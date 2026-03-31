import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
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

  return (
    <div style={{ ...style, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={handleCardClick}>
      {/* Image container */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1.25',
        backgroundColor: 'var(--color-surface-container-low)',
        borderRadius: '24px', overflow: 'hidden', padding: '16px'
      }}>
        {/* Background gradient block logic from app */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          backgroundColor: 'var(--color-surface-container)',
          borderRadius: '24px'
        }} />
        
        <img 
          src={product.img} 
          alt={getLoc(product.name)}
          style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Badges */}
        {product.badge && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 20,
            backgroundColor: product.badgeType === 'new' ? 'var(--color-primary)' : 'var(--color-secondary-container)',
            color: product.badgeType === 'new' ? 'var(--color-on-primary)' : 'var(--color-secondary)',
            padding: '4px 12px', borderRadius: '12px',
            fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            {product.badge}
          </div>
        )}

        {/* Favorite */}
        <button 
          onClick={handleLike}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 20,
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: liked ? 'rgba(118, 89, 45, 0.1)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--color-secondary)'
          }}
        >
          <Heart size={20} color="var(--color-secondary)" fill={liked ? 'var(--color-secondary)' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div style={{ paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '4px', lineHeight: '1.2' }}>
          {getLoc(product.name)}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '12px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '34px' }}>
          {getLoc(product.desc)}
        </p>

        {/* Spacer to push pricing down */}
        <div style={{ flex: 1 }} />

        {/* Pricing & Add to cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
             <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{product.price} AZN</span>
             {product.oldPrice && (
               <span style={{ fontSize: '12px', color: 'var(--color-outline-variant)', textDecoration: 'line-through', marginLeft: '6px' }}>
                 {product.oldPrice} AZN
               </span>
             )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); alert(t('added')); }}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(56, 69, 50, 0.3)'
            }}
          >
            <ShoppingCart size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
