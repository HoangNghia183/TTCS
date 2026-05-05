import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/types/user";
import DataTable, { type Column } from "@/components/features/admin/DataTable";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";

const UserManagePage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData()
    }, []);
    const loadData = async () => {
        try {
            const users = await userService.getAllUsers();
            setUsers(users);
        } finally {
            setLoading(false);
        }
    }

    const toggleBlock = async (u: User) => {
        const isBlocked = (u as unknown as { isBlocked?: boolean }).isBlocked;
        try {
            if (isBlocked) {
                await userService.unblockUser(u._id);
                toast.success(`Đã mở khóa ${u.displayName}!`);
            } else {
                await userService.blockUser(u._id);
                toast.success(`Đã khóa ${u.displayName}!`);
            }
            setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isBlocked: !isBlocked } : x));
        } catch {
            toast.error("Không thể thực hiện. Vui lòng thử lại.");
        }
    };

    const columns: Column<User>[] = [
        {
            key: "user", header: "Người dùng", render: (u) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--pet-coral)] to-[var(--pet-mint)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.displayName?.[0] ?? u.username?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                </div>
            )
        },
        { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground text-sm">{u.email}</span> },
        { key: "role", header: "Vai trò", render: (u) => <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(u as unknown as { role?: string }).role === "admin" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>{(u as unknown as { role?: string }).role ?? "user"}</span> },
        { key: "joined", header: "Ngày tham gia", render: (u) => formatDate((u as unknown as { createdAt?: string }).createdAt ?? "") },
        {
            key: "status", header: "Trạng thái", render: (u) => {
                const isBlocked = (u as unknown as { isBlocked?: boolean }).isBlocked;
                return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isBlocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>{isBlocked ? "Đã khóa" : "Hoạt động"}</span>;
            }
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="section-title">👥 Quản Lý Người Dùng</h1>
            <DataTable
                columns={columns}
                data={users}
                keyExtractor={(u) => u._id}
                isLoading={loading}
                emptyText="Không có người dùng nào."
                actions={(u) => {
                    const isBlocked = (u as unknown as { isBlocked?: boolean }).isBlocked;
                    return (
                        <button onClick={() => toggleBlock(u)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isBlocked ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                            {isBlocked ? "Mở khóa" : "Khóa"}
                        </button>
                    );
                }}
            />
        </div>
    );
};

export default UserManagePage;