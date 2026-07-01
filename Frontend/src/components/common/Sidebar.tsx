import { NavLink } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

interface SidebarProps {
    mode?: "admin" | "user";
}

const adminLinks = [
    { to: "/admin", label: "Tổng quan", end: true },
    { to: "/admin/products", label: "Sản phẩm" },
    { to: "/admin/ebooks", label: "Quản lý eBook" },
    { to: "/admin/orders", label: "Đơn hàng" },
    { to: "/admin/users", label: "Người dùng" },
    { to: "/admin/coupons", label: "Mã giảm giá" },
    { to: "/admin/reviews", label: "Đánh giá" },
    { to: "/admin/warranty", label: "Bảo hành" },
];

const userLinks = [
    { to: "/profile", label: "Tài khoản", end: true },
    { to: "/orders", label: "Đơn hàng" },
    { to: "/my-ebooks", label: "eBook của tôi" },
    { to: "/wishlist", label: "Yêu thích" },
    { to: "/warranty", label: "Bảo hành" },
];

const Sidebar = ({ mode = "user" }: SidebarProps) => {
    const { user } = useAuthStore();
    const links = mode === "admin" ? adminLinks : userLinks;

    return (
        <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* User info */}
                <div className="p-4 border-b border-border bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pet-coral)] to-[var(--pet-mint)] flex items-center justify-center text-white font-bold shrink-0">
                            {(user?.displayName || user?.username)?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">
                                {user?.displayName || user?.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="p-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                 transition-all duration-150 mb-0.5
                 ${isActive
                                    ? "bg-[var(--pet-coral)] text-white shadow-sm"
                                    : "text-muted-foreground hover:text-[var(--pet-coral)] hover:bg-red-50 dark:hover:bg-red-950/30"
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;