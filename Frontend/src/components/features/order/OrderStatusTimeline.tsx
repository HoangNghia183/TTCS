import type { Order, OrderStatusHistoryItem } from "@/types/order";
import { formatDate } from "@/utils/format";

const TIMELINE_LABELS: Record<string, string> = {
    Created: "Đơn hàng đã được tạo",
    Pending: "Chờ xác nhận",
    Processing: "Đơn hàng đang được xử lý",
    Shipping: "Đơn hàng đang được giao",
    Delivered: "Đơn hàng đã giao thành công",
    CancelRequested: "Khách hàng đã yêu cầu hủy đơn",
    CancelRejected: "Shop đã từ chối yêu cầu hủy đơn",
    Cancelled: "Đơn hàng đã bị hủy",
};

const ROLE_LABELS: Record<string, string> = {
    customer: "Khách hàng",
    admin: "Quản trị viên",
    system: "Hệ thống",
};

const ORDER_STATUS_FLOW = ["Pending", "Processing", "Shipping", "Delivered"];

const buildFallbackTimeline = (order: Order): OrderStatusHistoryItem[] => {
    const createdAt = order.createdAt || order.updatedAt;
    const items: OrderStatusHistoryItem[] = [];

    if (order.status === "Cancelled") {
        items.push({
            status: "Pending",
            note: TIMELINE_LABELS.Pending,
            updatedAt: createdAt,
            updatedByRole: "system",
        });
        items.push({
            status: "Cancelled",
            note: TIMELINE_LABELS.Cancelled,
            updatedAt: order.updatedAt || createdAt,
            updatedByRole: "admin",
        });
    } else {
        const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
        if (currentIndex >= 0) {
            for (let i = 0; i <= currentIndex; i++) {
                const st = ORDER_STATUS_FLOW[i] as OrderStatus;
                items.push({
                    status: st,
                    note: TIMELINE_LABELS[st] || st,
                    updatedAt: i === currentIndex ? (order.updatedAt || createdAt) : createdAt,
                    updatedByRole: "system",
                });
            }
        } else {
            items.push({
                status: order.status,
                note: TIMELINE_LABELS[order.status] ?? order.status,
                updatedAt: order.updatedAt || createdAt,
                updatedByRole: "system",
            });
        }
    }

    if (order.cancelRequestedAt) {
        items.push({
            status: "CancelRequested",
            note: order.cancelReason
                ? `${TIMELINE_LABELS.CancelRequested}: ${order.cancelReason}`
                : TIMELINE_LABELS.CancelRequested,
            updatedAt: order.cancelRequestedAt,
            updatedByRole: "customer",
        });
    }

    return items;
};

interface OrderStatusTimelineProps {
    order: Order;
    compact?: boolean;
}

const OrderStatusTimeline = ({ order, compact = false }: OrderStatusTimelineProps) => {
    const timeline = (order.statusHistory?.length ? order.statusHistory : buildFallbackTimeline(order))
        .filter((item) => item.status)
        .sort((a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime());

    if (!timeline.length) {
        return (
            <div className="text-sm text-muted-foreground py-4">
                Chưa có lịch sử cập nhật.
            </div>
        );
    }

    const latestIndex = timeline.length - 1;

    return (
        <div className={compact ? "space-y-3" : "bg-white dark:bg-card rounded-2xl border border-border p-5 mb-5"}>
            {!compact && (
                <div className="mb-5">
                    <h2 className="font-bold text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Theo dõi đơn hàng
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Lịch sử đơn hàng được cập nhật theo từng trạng thái.</p>
                </div>
            )}

            <div className="relative">
                {timeline.map((item, index) => {
                    const isLatest = index === latestIndex;
                    const isCompleted = index < latestIndex;
                    const roleLabel = item.updatedByRole ? ROLE_LABELS[item.updatedByRole] ?? item.updatedByRole : "";

                    let bgClass = "bg-muted text-muted-foreground";
                    let icon: React.ReactNode = index + 1;

                    if (item.status === "Cancelled") {
                        bgClass = "bg-red-500 text-white shadow-sm";
                        icon = "✕";
                    } else if (item.status === "Delivered") {
                        bgClass = "bg-emerald-500 text-white shadow-sm";
                        icon = "✓";
                    } else if (isLatest) {
                        bgClass = "bg-[var(--pet-coral)] text-white shadow-sm";
                    } else if (isCompleted) {
                        bgClass = "bg-emerald-500 text-white";
                    }

                    return (
                        <div key={`${item.status}-${item.updatedAt}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                            {index < latestIndex && (
                                <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[var(--pet-coral)]/35" />
                            )}
                            <span
                                className={`relative z-10 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${bgClass}`}
                            >
                                {icon}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground">
                                    {item.note || TIMELINE_LABELS[item.status] || item.status}
                                </p>
                                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                    {item.updatedAt && <span>{formatDate(item.updatedAt)}</span>}
                                    {roleLabel && <span>• {roleLabel}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusTimeline;
