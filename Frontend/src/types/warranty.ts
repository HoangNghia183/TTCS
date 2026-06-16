export type WarrantyStatus = "Pending" | "Approved" | "Rejected" | "Completed";

export interface WarrantyRequest {
    _id: string;
    user: {
        _id: string;
        displayName?: string;
        username?: string;
        email?: string;
        phone?: string;
    };
    order: string;
    product: {
        _id: string;
        name: string;
        price?: number;
        image?: string;
    };
    reason: string;
    images: string[];
    status: WarrantyStatus;
    adminResponse?: string;
    createdAt: string;
    updatedAt: string;
}