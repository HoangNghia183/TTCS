import { create } from "zustand";
import { collectionService } from "@/services/collectionService";
import type { Product } from "@/types/product";

interface WishlistState {
    items: Product[];
    loading: boolean;
    initialized: boolean;
    fetchWishlist: () => Promise<void>;
    toggleWishlist: (product: Product) => Promise<void>;
    isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    initialized: false,
    fetchWishlist: async () => {
        if (get().initialized || get().loading) return;
        set({ loading: true });
        try {
            const items = await collectionService.getWishlist();
            set({ items, initialized: true });
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            set({ loading: false });
        }
    },
    toggleWishlist: async (product: Product) => {
        const { items } = get();
        const exists = items.some(item => item.id === product.id);
        
        // Optimistic update
        if (exists) {
            set({ items: items.filter(item => item.id !== product.id) });
            try {
                await collectionService.removeFromWishlist(product.id);
            } catch {
                // Revert on error
                set({ items });
            }
        } else {
            set({ items: [...items, product] });
            try {
                await collectionService.addToWishlist(product.id);
            } catch {
                // Revert on error
                set({ items });
            }
        }
    },
    isWishlisted: (productId: string) => {
        return get().items.some(item => item.id === productId);
    }
}));
