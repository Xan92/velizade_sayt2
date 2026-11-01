import { siteConfig } from './siteConfig';

// 12.350000001 kimi qiymətlərin görünməməsi üçün
export const formatPrice = (value) => {
  const n = Math.round(Number(value || 0) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

export const whatsappLink = (text) => `${siteConfig.whatsappUrl}?text=${encodeURIComponent(text)}`;

export const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};
