import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  shop_id: number;
  shop_name: string;
  name: string;
  price: number;
  mrp?: number;
  qty: number;
  image_url?: string;
  unit?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (product_id: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
  shopId: () => number | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        // Warn if mixing shops
        const existingShop = items[0]?.shop_id;
        if (existingShop && existingShop !== newItem.shop_id) {
          // Clear cart and start fresh with new shop
          set({ items: [{ ...newItem, qty: 1 }], isOpen: true });
          return;
        }
        const existing = items.find(i => i.product_id === newItem.product_id);
        if (existing) {
          set({ items: items.map(i => i.product_id === newItem.product_id ? { ...i, qty: i.qty + 1 } : i), isOpen: true });
        } else {
          set({ items: [...items, { ...newItem, qty: 1 }], isOpen: true });
        }
      },

      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.product_id !== id) })),

      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return; }
        set(s => ({ items: s.items.map(i => i.product_id === id ? { ...i, qty } : i) }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => parseFloat(get().items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)),
      itemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
      shopId: () => get().items[0]?.shop_id || null,
    }),
    { name: 'credikart-cart' }
  )
);
