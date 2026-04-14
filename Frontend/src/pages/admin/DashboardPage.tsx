import StatCard from "@/components/features/admin/StatCard";
import { formatCurrency } from "@/utils/format";

const MOCK_ORDERS = [
    { id: "ORD001", customer: "Nguyễn Văn A", total: 2500000, status: "delivered", date: "2026-02-25" },
    { id: "ORD002", customer: "Trần Thị B", total: 890000, status: "shipping", date: "2026-02-25" },
    { id: "ORD003", customer: "Lê Minh C", total: 15000000, status: "confirmed", date: "2026-02-24" },
    { id: "ORD004", customer: "Phạm Thu D", total: 450000, status: "pending", date: "2026-02-24" },
    { id: "ORD005", customer: "Vũ Hải E", total: 3200000, status: "cancelled", date: "2026-02-23" },
];

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipping: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ xác nhận", confirmed: "Đã xác nhận",
    shipping: "Đang giao", delivered: "Thành công", cancelled: "Đã hủy",
};

const DashboardPage = () => {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="section-title">📊 Tổng Quan</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Doanh thu tháng" value={formatCurrency(128500000)} icon="💰" color="coral" trend={12} />
                <StatCard label="Đơn hàng mới" value="48" icon="📦" color="mint" trend={5} />
                <StatCard label="Người dùng" value="1,234" icon="👥" color="amber" trend={8} />
                <StatCard label="Sản phẩm" value="89" icon="📚" color="purple" trend={-2} />
            </div>

            {/* Recent orders */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Đơn hàng gần đây</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                {["Mã đơn", "Khách hàng", "Ngày", "Tổng tiền", "Trạng thái"].map((h) => (
                                    <th key={h} className="pb-3 pr-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_ORDERS.map((o) => (
                                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                    <td className="py-3 pr-4 font-mono text-xs text-foreground font-semibold">{o.id}</td>
                                    <td className="py-3 pr-4 text-foreground">{o.customer}</td>
                                    <td className="py-3 pr-4 text-muted-foreground">{o.date}</td>
                                    <td className="py-3 pr-4 font-bold text-[var(--pet-coral)]">{formatCurrency(o.total)}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                                            {STATUS_LABELS[o.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;