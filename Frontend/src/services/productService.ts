import api from "@/lib/axios";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/types/api";
import { categoryService } from "@/services/categoryService";


export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "price_asc" | "price_desc" | "newest" | "popular";
}

export interface ReviewPayload {
    rating: number;
    comment: string;
}
interface RawProductListResponse {
    products: unknown[];
    page: number;
    pages: number;   // total pages
    total: number;
}

interface RawSingleResponse {
    // controller returns the document directly (no wrapper)
    [key: string]: unknown;
}

export const productService = {
    /** Fetch paginated product list. Adapts backend { products, page, pages, total } */
    getAll: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
        const params = new URLSearchParams();

        // Map frontend filter keys → query params the backend understands
        if (filters.page) params.append("page", String(filters.page));
        if (filters.limit) params.append("limit", String(filters.limit));
        if (filters.search) params.append("keyword", filters.search);  // backend uses "keyword"

        // ── KEY FIX: resolve category slug → MongoDB ObjectId ──────────────
        // Product.category is an ObjectId ref in MongoDB, not a plain string.
        // resolveId returns null when the slug isn't in the DB — in that case
        // we skip the filter entirely to avoid a Mongoose CastError → 500.
        if (filters.category) {
            const resolvedId = await categoryService.resolveId(filters.category);
            if (resolvedId) params.append("category", resolvedId);
        }

        if (filters.minPrice) params.append("price[gte]", String(filters.minPrice));
        if (filters.maxPrice) params.append("price[lte]", String(filters.maxPrice));

        // Map frontend sort labels → backend sort strings
        const sortMap: Record<string, string> = {
            price_asc: "price",
            price_desc: "-price",
            popular: "-sold",
            newest: "-createdAt",
        };
        if (filters.sort) params.append("sort", sortMap[filters.sort] ?? "-createdAt");

        const res = await api.get<RawProductListResponse>(`/products?${params.toString()}`);
        const raw = res.data;

        return {
            data: (raw.products ?? []) as Product[],
            total: raw.total ?? 0,
            page: raw.page ?? 1,
            limit: filters.limit ?? 10,
            totalPages: raw.pages ?? 1,
        };
    },


    /** Fetch a single product by id. Backend returns the document directly. */
    getById: async (id: string): Promise<Product> => {
        const res = await api.get<any>(`/products/${id}`);
        return res.data as Product;
    },

    create: async (data: FormData): Promise<Product> => {
        const res = await api.post<any>("/products", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data as Product;
    },
// RawSingleResponse
    update: async (id: string, data: FormData): Promise<Product> => {
        const res = await api.put<any>(`/products/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data as Product;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    submitReview: async (productId: string, payload: ReviewPayload): Promise<void> => {
        await api.post(`/products/${productId}/reviews`, payload);
    },
};