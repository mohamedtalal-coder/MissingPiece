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
};

export const ar = {
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
};

export const translations = { en, ar };

export type Language = keyof typeof translations;
export type Translation = typeof translations.en;