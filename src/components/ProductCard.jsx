import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, MessageCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { getThumbUrl } from '../config/imageUtils';
import { formatPrice, showToast, whatsappLink } from '../config/format';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';

function ProductCard({ product, style }) {
  const navigate = useNavigate();
  const { toggle, isLiked } = useWishlist();
  const { addToCart } = useCart();
  const { t, getLoc } = useLocale();
  const liked = isLiked(product.id);
  const name = getLoc(product.name);
  const hasPrice = product.price != null;

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
    showToast(t('added', 'Səbətə əlavə edildi!'));
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) handleCardClick(); }}
      role="link"
      tabIndex={0}
      aria-label={name}
      style={style}
      className="product-card"
    >
      {/* Image container */}
      <div className="product-card-media">
        <img
          src={getThumbUrl(product.img)}
          alt={name}
          loading="lazy"
          decoding="async"
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
          aria-label={liked ? t('remove_fav', 'Sevimlilərdən çıxart') : t('add_fav', 'Sevimlilərə əlavə et')}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 10,
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: liked ? 'var(--clr-rose)' : 'rgba(14,11,15,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: liked ? '#1a1e14' : 'var(--clr-white)',
            transition: 'background var(--transition), transform var(--transition)'
          }}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      {/* Info */}
      <div className="card-body" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="card-title">{name}</h3>
        <p className="card-desc" style={{
          fontSize: '13px', color: 'var(--clr-muted)', marginBottom: '14px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '36px',
          flex: 1
        }}>
          {getLoc(product.desc)}
        </p>

        {/* Pricing & Add to cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
             {hasPrice ? (
               <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--clr-rose-lt)' }}>{formatPrice(product.price)} AZN</span>
             ) : (
               <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--clr-rose-lt)', lineHeight: '1.3' }}>{t('price_on_request')}</span>
             )}
             {hasPrice && product.oldPrice && (
               <span style={{ fontSize: '13px', color: 'var(--clr-muted)', textDecoration: 'line-through' }}>
                 {formatPrice(product.oldPrice)} AZN
               </span>
             )}
          </div>
          {hasPrice ? (
            <button
              onClick={handleAddToCart}
              aria-label={t('add_to_cart', 'Səbətə əlavə et')}
              style={{
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: 'var(--clr-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1a1e14', transition: 'var(--transition)'
              }}
            >
              <ShoppingBag size={19} aria-hidden="true" />
            </button>
          ) : (
            <a
              href={whatsappLink(`${t('wa_product_msg')} ${name}`)}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label={t('order_whatsapp')}
              style={{
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                border: '1px solid var(--clr-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--clr-rose-lt)'
              }}
            >
              <MessageCircle size={19} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
