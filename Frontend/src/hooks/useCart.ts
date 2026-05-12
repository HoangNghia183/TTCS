import { useCartStore } from "@/stores/useCartStore";
import type { Product } from "@/types/product";

/**
 * Convenience hook that wraps useCartStore with formatted helpers.
 */
export const useCart = () => {
    const { items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice } =
        useCartStore();

    const isInCart = (productId: string) =>
        items.some((i) => i.product._id === productId);

    const getQty = (productId: string) =>
        items.find((i) => i.product._id === productId)?.quantity ?? 0;

    const toggleItem = (product: Product) => {
        if (isInCart(product._id)) {
            removeItem(product._id);
        } else {
            addItem(product);
        }
    };

    return {
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        count: totalCount(),
        subtotal: totalPrice(),
        isInCart,
        getQty,
        toggleItem,
    };
};