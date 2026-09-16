// src/features/wishlist/wishlistApi.ts

export const wishlistApi = {
  get: async () => {
    try {
      const saved = localStorage.getItem('mp_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  add: async (product: any) => {
    try {
      const saved = localStorage.getItem('mp_wishlist');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.some((item: any) => item.id === product.id)) {
        list.push(product);
        localStorage.setItem('mp_wishlist', JSON.stringify(list));
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  remove: async (id: any) => {
    try {
      const saved = localStorage.getItem('mp_wishlist');
      let list = saved ? JSON.parse(saved) : [];
      list = list.filter((item: any) => item.id !== id);
      localStorage.setItem('mp_wishlist', JSON.stringify(list));
      return { success: true };
    } catch {
      return { success: false };
    }
  }
};

export default wishlistApi;