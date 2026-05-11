import api from "@/lib/axios";
import type { Order, OrderStatus, ShippingAddress, PaymentMethod } from "@/types/order";
import type { ApiResponse } from "@/types/api";

export interface CreateOrderPayload {
    items: { product: string; qty: number }[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    discountAmount?: number;
    couponCode?: string;
    note?: string;
}

export const orderService = {
    createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
        console.log(payload)
        const res = await api.post<ApiResponse<Order>>("/orders", payload);
        return res.data.data;
    },

    getMyOrders: async (): Promise<Order[]> => {
        const res = await api.get<ApiResponse<any[]>>("/orders/my");
        // Backend now returns wrapped response with data field
        const ordersData = res.data.data || [];
        
        // Map status from backend format to frontend format
        const statusMap: Record<string, string> = {
            'Pending': 'pending',
            'Processing': 'confirmed',
            'Shipping': 'shipping',
            'Delivered': 'delivered',
            'Cancelled': 'cancelled'
        };

        return ordersData.map((order: any) => ({
            _id: order._id,
            userId: typeof order.user === 'string' ? order.user : order.user?._id || '',
            items: (order.orderItems || []).map((item: any) => ({
                productId: typeof item.product === 'string' ? item.product : item.product?._id || '',
                productName: item.name || '',
                productImage: item.image || '',
                quantity: item.qty || 0,
                price: item.price || 0,
            })),
            shippingAddress: order.shippingAddress || {},
            subtotal: order.itemsPrice || 0,
            discount: order.discountAmount || 0,
            shippingFee: order.shippingPrice || 0,
            total: order.totalPrice || 0,
            couponCode: order.couponCode,
            paymentMethod: order.paymentMethod || 'cod',
            paymentStatus: order.isPaid ? 'paid' : 'unpaid',
            status: statusMap[order.status] || 'pending',
            note: order.note,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        })) as Order[];
    },

    getOrderById: async (id: string): Promise<Order> => {
        const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
        return res.data.data;
    },

    getAllOrders: async (page = 1, limit = 20): Promise<{ orders: Order[] }> => {
        const res = await api.get<ApiResponse<{ orders: Order[]; total: number }>>(
            `/orders?page=${page}&limit=${limit}`
        );
        return res.data.data;
    },

    updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        const res = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
        return res.data.data;
    },

    cancelOrder: async (id: string): Promise<void> => {
        await api.put(`/orders/${id}/cancel`);
    },
};