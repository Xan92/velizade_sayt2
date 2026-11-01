import { useEffect } from 'react';

const DEFAULT_TITLE = 'Aliza Flowers — Bakıda Gül və Buket Çatdırılması';

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Aliza Flowers` : DEFAULT_TITLE;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://aliza.az${window.location.pathname}`);
  }, [title, description]);
}
