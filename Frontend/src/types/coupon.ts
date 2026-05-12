export interface Coupon {
    _id: string;
    code: string;
    discountType: "percent" | "fixed";
    value: number;
    minOrderValue: number;
    expirationDate: string;
    usageLimit: number;
    usedCount: number;
    createdAt: string;
    updatedAt: string;
}