import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Sidebar from "@/components/common/Sidebar";
import { orderService } from "@/services/orderService";
import type { Order, OrderItem } from "@/types/order";
import { formatCurrency, formatDate } from "@/utils/format";
import Loading from "@/components/common/Loading";

interface PurchasedBook extends OrderItem {
    orderId: string;
    orderDate: string;
}

const MyBookPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderService
            .getMyOrders()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const purchasedBooks = useMemo(() => {
        const itemsByProduct = new Map<string, PurchasedBook>();

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const existing = itemsByProduct.get(item.productId);
                const currentItem: PurchasedBook = {
                    ...item,
                    orderId: order._id,
                    orderDate: order.createdAt,
                };

                if (!existing || new Date(order.createdAt) > new Date(existing.orderDate)) {
                    itemsByProduct.set(item.productId, currentItem);
                }
            });
        });

        return Array.from(itemsByProduct.values());
    }, [orders]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
            <Sidebar mode="user" />

            <main className="flex-1">
                <h1 className="section-title mb-6">📚 Sách đã mua</h1>

                {loading ? (
                    <Loading />
                ) : purchasedBooks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-3">📚</div>
                        <p className="text-muted-foreground">Bạn chưa mua sách nào.</p>
                        <Link to="/shop" className="btn-pet-primary mt-4 inline-flex">
                            Khám phá sách
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {purchasedBooks.map((book) => (
                            <article
                                key={book.productId}
                                className="bg-white dark:bg-card rounded-3xl border border-border p-5 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <img
                                        src={book.productImage}
                                        alt={book.productName}
                                        className="w-full sm:w-40 h-40 object-cover rounded-3xl shrink-0"
                                    />
                                    <div className="flex-1">
                                        <Link
                                            to={`/product/${book.productId}`}
                                            className="text-lg font-semibold text-foreground hover:text-[var(--pet-coral)]"
                                        >
                                            {book.productName}
                                        </Link>

                                        <div className="mt-3 text-sm text-muted-foreground space-y-2">
                                            <p>
                                                Số lượng: <span className="font-semibold text-foreground">{book.quantity}</span>
                                            </p>
                                            <p>
                                                Giá mua: <span className="font-semibold text-[var(--pet-coral)]">{formatCurrency(book.price)}</span>
                                            </p>
                                            <p>
                                                Đơn hàng: <span className="font-mono">{book.orderId.slice(-8).toUpperCase()}</span>
                                            </p>
                                            <p>Mua ngày: {formatDate(book.orderDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookPage;
