import api from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";

export interface Ebook {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    pdfFile: string;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    specifications?: Record<string, string>;
    sold: number;
    views: number;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface EbookFilters {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "price_asc" | "price_desc" | "newest" | "popular";
}

export const ebookService = {
    // --- Lấy danh sách eBook ---
    getEbooks: async (filters: EbookFilters = {}): Promise<PaginatedResponse<Ebook>> => {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.category) params.append("category", filters.category);
        if (filters.search) params.append("keyword", filters.search);
        if (filters.minPrice !== undefined) params.append("price[gte]", filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append("price[lte]", filters.maxPrice.toString());

        if (filters.sort) {
            const sortMap: Record<string, string> = {
                price_asc: "price",
                price_desc: "-price",
                newest: "-createdAt",
                popular: "-sold",
            };
            if (sortMap[filters.sort]) {
                params.append("sort", sortMap[filters.sort]);
            }
        }

        const response = await api.get<{ success: boolean; data: Ebook[]; totalPages: number; currentPage: number }>(
            `/ebooks?${params.toString()}`
        );
        return {
            data: response.data.data,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage,
        };
    },

    // --- Lấy chi tiết eBook ---
    getEbookBySlug: async (slug: string): Promise<Ebook> => {
        const response = await api.get<Ebook>(`/ebooks/slug/${slug}`);
        return response.data;
    },

    // --- Mua eBook trực tiếp qua VNPay ---
    buyEbookDirectly: async (ebookId: string): Promise<{ paymentUrl: string }> => {
        const response = await api.post<{ paymentUrl: string }>("/orders/ebook", { ebookId });
        return response.data;
    },

    // --- Danh sách eBook đã mua ---
    getMyEbooks: async (): Promise<Ebook[]> => {
        const response = await api.get<{ success: boolean; data: Ebook[] }>("/ebooks/my-ebooks");
        return response.data.data;
    },

    // --- Tải xuống PDF ---
    downloadEbookUrl: (ebookId: string): string => {
        // Trả về URL để gán vào thẻ <a> tải trực tiếp
        // Cần truyền Token nếu trình duyệt không tự gửi cookie
        // Tốt nhất là fetch blob rồi tải về
        return `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/ebooks/${ebookId}/download`;
    },
    
    downloadEbookBlob: async (ebookId: string, filename: string, ext: string = 'pdf') => {
        const response = await api.get(`/ebooks/${ebookId}/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    },

    // --- Đánh giá eBook ---
    submitReview: async (ebookId: string, review: { rating: number; comment: string }): Promise<void> => {
        await api.post(`/ebooks/${ebookId}/reviews`, review);
    },

    // --- ADMIN API ---
    createEbook: async (formData: FormData): Promise<Ebook> => {
        const response = await api.post<Ebook>("/ebooks", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateEbook: async (id: string, formData: FormData): Promise<Ebook> => {
        const response = await api.put<Ebook>(`/ebooks/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteEbook: async (id: string): Promise<void> => {
        await api.delete(`/ebooks/${id}`);
    },
};
