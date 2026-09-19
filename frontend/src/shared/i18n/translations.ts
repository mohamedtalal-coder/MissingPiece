import navEn from './locales/en/nav.json';
import footerEn from './locales/en/footer.json';
import homeEn from './locales/en/home.json';
import productDetailEn from './locales/en/productDetail.json';
import commonEn from './locales/en/common.json';
import contactEn from './locales/en/contact.json';
import adminMessagesEn from './locales/en/adminMessages.json';
import aboutEn from './locales/en/about.json';
import wishlistEn from './locales/en/wishlist.json';
import adminOrdersEn from './locales/en/adminOrders.json';
import checkoutEn from './locales/en/checkout.json';
import orderHistoryEn from './locales/en/orderHistory.json';
import productListEn from './locales/en/productList.json';
import adminProductsEn from './locales/en/adminProducts.json';
import cartEn from './locales/en/cart.json';
import adminPanelEn from './locales/en/adminPanel.json';
import faqEn from './locales/en/faq.json';

import navAr from './locales/ar/nav.json';
import footerAr from './locales/ar/footer.json';
import homeAr from './locales/ar/home.json';
import productDetailAr from './locales/ar/productDetail.json';
import commonAr from './locales/ar/common.json';
import contactAr from './locales/ar/contact.json';
import adminMessagesAr from './locales/ar/adminMessages.json';
import aboutAr from './locales/ar/about.json';
import wishlistAr from './locales/ar/wishlist.json';
import adminOrdersAr from './locales/ar/adminOrders.json';
import checkoutAr from './locales/ar/checkout.json';
import orderHistoryAr from './locales/ar/orderHistory.json';
import productListAr from './locales/ar/productList.json';
import adminProductsAr from './locales/ar/adminProducts.json';
import cartAr from './locales/ar/cart.json';
import adminPanelAr from './locales/ar/adminPanel.json';
import faqAr from './locales/ar/faq.json';

export const en = {
  nav: navEn,
  footer: footerEn,
  home: homeEn,
  productDetail: productDetailEn,
  common: commonEn,
  contact: contactEn,
  adminMessages: adminMessagesEn,
  about: aboutEn,
  wishlist: wishlistEn,
  adminOrders: adminOrdersEn,
  checkout: checkoutEn,
  orderHistory: orderHistoryEn,
  productList: productListEn,
  adminProducts: adminProductsEn,
  cart: cartEn,
  adminPanel: adminPanelEn,
  faq: faqEn,
};

const arRaw = {
  nav: navAr,
  footer: footerAr,
  home: homeAr,
  productDetail: productDetailAr,
  common: commonAr,
  contact: contactAr,
  adminMessages: adminMessagesAr,
  about: aboutAr,
  wishlist: wishlistAr,
  adminOrders: adminOrdersAr,
  checkout: checkoutAr,
  orderHistory: orderHistoryAr,
  productList: productListAr,
  adminProducts: adminProductsAr,
  cart: cartAr,
  adminPanel: adminPanelAr,
  faq: faqAr,
};

function deepMerge<T>(target: any, source: any): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output as T;
}

function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Ensure Arabic has all English keys as fallback
export const ar = deepMerge<typeof en>(en, arRaw);

export const translations = { en, ar };

export type Language = keyof typeof translations;
export type Translation = typeof translations.en;