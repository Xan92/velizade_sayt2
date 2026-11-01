const FALLBACK = 'assets/site/qirmizi-cehrayi-qizilgul-vaza-buketi-qara-fon.webp';

export const getAssetUrl = (path) => {
  if (!path) return `${import.meta.env.BASE_URL}${FALLBACK}`;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.replace(/^\.?\//, '');
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${cleanPath}`;
};

// Kartlar üçün kiçik versiya (yalnız yerli kataloq şəkillərinin -600 variantı var)
export const getThumbUrl = (path) => {
  if (path && path.includes('assets/products/')) return getAssetUrl(path.replace(/\.webp$/, '-600.webp'));
  return getAssetUrl(path);
};
