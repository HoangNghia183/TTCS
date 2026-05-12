export type OrderStatus = "Pending" | "Processing" | "Shipping" | "Delivered" | "Cancelled";
export type PaymentMethod = "vnpay" | "cod";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
    product: string; // ObjectId reference
    name: string;
    qty: number;
    price: number;
    image: string;
}

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    district: string;
    phone: string;
}

export interface PaymentResult {
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
}

export interface Order {
    _id: string;
    user: string; // ObjectId reference
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    paymentResult?: PaymentResult;
    itemsPrice: number;
    shippingPrice: number;
    discountAmount: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    status: OrderStatus;
    coupon?: string; // ObjectId reference
    createdAt: string;
    updatedAt: string;
}