export type ProductCategory = "fiction" | "children" | "self-help" | "science" | "literature" | "business" | "accessory";
export type ProductBadge = "new" | "hot" | "sale";

export interface Product {
    id: string;
    name: string;
    breed: string;
    age: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    category: ProductCategory;
    categoryId?: string;
    rating: number;
    reviewCount: number;
    badge?: ProductBadge;
    description: string;
    inStock: boolean;
    stock?: number;
    author?: string;
    publisher?: string;
    reviews?: ProductReview[];
}

export interface ProductReview {
    _id: string;
    user: {
        _id: string;
        displayName?: string;
        username?: string;
        avatarUrl?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface BookCategory {
    id: string;
    label: string;
    emoji: string;
}

// Static category list — used by ProductFilter and HomePage
export const petCategories: BookCategory[] = [
    { id: "all", label: "Tất Cả", emoji: "📚" },
    { id: "fiction", label: "Tiểu Thuyết", emoji: "📖" },
    { id: "children", label: "Thiếu Nhi", emoji: "🎈" },
    { id: "self-help", label: "Kỹ Năng", emoji: "💡" },
    { id: "science", label: "Khoa Học", emoji: "🔬" },
    { id: "literature", label: "Văn Học", emoji: "✒️" },
    { id: "business", label: "Kinh Doanh", emoji: "💼" },
    { id: "accessory", label: "VPP", emoji: "✏️" },
];
