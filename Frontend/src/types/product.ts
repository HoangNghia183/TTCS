export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string; // ObjectId reference
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
