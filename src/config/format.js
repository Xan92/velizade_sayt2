import { siteConfig } from './siteConfig';

// 12.350000001 kimi qiymətlərin görünməməsi üçün
export const formatPrice = (value) => {
  const n = Math.round(Number(value || 0) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

// Azərbaycan mobil nömrəsi: 050, 051, 010, 055, 099, 070, 077 (+994 ilə və ya onsuz)
export const isValidAzPhone = (value) =>
  /^(50|51|10|55|99|70|77)\d{7}$/.test(String(value || '').replace(/\D/g, '').replace(/^(994|0)/, ''));

export const whatsappLink = (text) => `${siteConfig.whatsappUrl}?text=${encodeURIComponent(text)}`;

export const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};
