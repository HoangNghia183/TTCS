import type { Category } from "./category";

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: Category; // ObjectId reference
    specifications: Record<string, string>;
    stock: number;
    sold: number;
    views: number;
    averageRating: number;
    reviewCount: number;
    dLoadLink?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface BookCategory {
    id: string;
    name: string;
    emoji: string;
}

// Static category list — used by ProductFilter and HomePage
export const petCategories: BookCategory[] = [
    { id: "all", name: "Tất Cả", emoji: "📚" },
    { id: "fiction", name: "Tiểu Thuyết", emoji: "📖" },
    { id: "children", name: "Thiếu Nhi", emoji: "🎈" },
    { id: "self-help", name: "Kỹ Năng", emoji: "💡" },
    { id: "science", name: "Khoa Học", emoji: "🔬" },
    { id: "literature", name: "Văn Học", emoji: "✒️" },
    { id: "business", name: "Kinh Doanh", emoji: "💼" },
    { id: "accessory", name: "VPP", emoji: "✏️" },
];
