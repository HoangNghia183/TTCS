import { useEffect, useState } from "react";
import { warrantyService } from "@/services/warrantyService";
import type { WarrantyRequest, WarrantyStatus } from "@/types/warranty";
import DataTable, { type Column } from "@/components/features/admin/DataTable";
import { formatDate } from "@/utils/format";
import { WARRANTY_STATUS_LABELS } from "@/utils/constants";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-600",
};

const WarrantyManagePage = () => {
    const [requests, setRequests] = useState<WarrantyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<WarrantyRequest | null>(null);

    useEffect(() => {
        warrantyService.getAllRequests().then(setRequests).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleStatus = async (id: string, status: WarrantyStatus) => {
        try {
            await warrantyService.updateStatus(id, status);
            setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
            toast.success("Cập nhật trạng thái thành công!");
        } catch { toast.error("Không thể cập nhật."); }
    };

    const columns: Column<WarrantyRequest>[] = [
        { key: "user", header: "Người dùng", render: (r) => <span className="text-sm font-semibold text-foreground">{r.user?.displayName || r.user?.username || r.user?.email || "N/A"}</span> },
        { key: "product", header: "Sản phẩm", render: (r) => <span className="text-sm text-muted-foreground line-clamp-1">{r.product?.name || "N/A"}</span> },
        { key: "issue", header: "Vấn đề", render: (r) => <span className="text-sm text-foreground line-clamp-2">{r.reason}</span> },
        { key: "date", header: "Ngày gửi", render: (r) => formatDate(r.createdAt) },
        {
            key: "status", header: "Trạng thái", render: (r) => (
                <select
                    value={r.status}
                    onChange={(e) => handleStatus(r._id, e.target.value as WarrantyStatus)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[r.status] || "bg-muted"}`}
                >
                    {Object.entries(WARRANTY_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            )
        },
        {
            key: "action", header: "Hành động", render: (r) => (
                <button
                    onClick={() => setSelectedRequest(r)}
                    className="p-2 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-lg transition-colors font-semibold text-xs"
                >
                    Chi tiết
                </button>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="section-title">🛡️ Quản Lý Bảo Hành</h1>
            <DataTable columns={columns} data={requests} keyExtractor={(r) => r._id} isLoading={loading} emptyText="Không có yêu cầu bảo hành nào." />
            
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-zoom-in">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-lg text-foreground">Chi tiết yêu cầu bảo hành</h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">✕</button>
                        </div>
                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Người yêu cầu:</p>
                                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.user?.displayName || selectedRequest.user?.username || "Không có tên"}</p>
                                <p className="text-sm text-muted-foreground">{selectedRequest.user?.email} {selectedRequest.user?.phone ? `- ${selectedRequest.user.phone}` : ""}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Sản phẩm:</p>
                                <div className="flex items-center gap-3 mt-2 bg-muted/30 p-2 rounded-xl">
                                    {selectedRequest.product?.image ? (
                                        <img src={selectedRequest.product.image} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">📦</div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-foreground line-clamp-2">{selectedRequest.product?.name}</p>
                                        <p className="text-xs text-[var(--pet-coral)] font-bold">{selectedRequest.product?.price?.toLocaleString("vi-VN")} đ</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Lý do bảo hành:</p>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl mt-1 whitespace-pre-wrap">{selectedRequest.reason}</p>
                            </div>
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-2">Hình ảnh đính kèm:</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {selectedRequest.images.map((img, i) => {
                                            // Handle relative paths from local uploads
                                            const imgSrc = img.startsWith('/') ? `http://localhost:5001${img}` : img;
                                            return (
                                                <a key={i} href={imgSrc} target="_blank" rel="noreferrer" className="shrink-0">
                                                    <img src={imgSrc} className="w-20 h-20 rounded-xl object-cover border border-border hover:opacity-80 transition-opacity" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarrantyManagePage;
