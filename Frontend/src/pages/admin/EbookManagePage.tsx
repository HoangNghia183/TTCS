import { useState, useEffect, useCallback } from "react";
import { ebookService } from "@/services/ebookService";
import type { Ebook } from "@/services/ebookService";
import DataTable, { type Column } from "@/components/features/admin/DataTable";
import Pagination from "@/components/common/Pagination";
import { formatCurrency, getImageUrl } from "@/utils/format";
import { toast } from "sonner";
import EbookFormModal from "@/components/features/admin/EbookFormModal";

const EbookManagePage = () => {
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const loadEbooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ebookService.getEbooks({
                page,
                limit: 10,
                search: searchTerm || undefined
            });
            setEbooks(res.data);
            setTotalPages(res.totalPages || 1);
        } catch {
            toast.error("Không thể tải danh sách eBook.");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => { loadEbooks(); }, [loadEbooks]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa eBook này?")) return;
        try {
            await ebookService.deleteEbook(id);
            toast.success("Đã xóa eBook.");
            setEbooks((prev) => prev.filter((p) => p._id !== id));
        } catch {
            toast.error("Xóa thất bại. Vui lòng thử lại.");
        }
    };

    const columns: Column<Ebook>[] = [
        {
            key: "ebook", header: "eBook", render: (p) => (
                <div className="flex items-center gap-3">
                    <img src={getImageUrl(p.images?.[0])} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                    <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1 max-w-[200px]" title={p.name}>{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.specifications?.author || "Không rõ tác giả"}</p>
                    </div>
                </div>
            )
        },
        { key: "category", header: "Danh mục", render: (p) => <span className="badge-new capitalize">{(p.category as any)?.name || 'N/A'}</span> },
        { key: "price", header: "Giá", render: (p) => <span className="font-bold text-[var(--pet-coral)]">{formatCurrency(p.price)}</span> },
        {
            key: "pdf", header: "Tài liệu", render: (p) => (
                <button
                    onClick={() => {
                        const ext = p.specifications?.format?.toLowerCase() || 'pdf';
                        ebookService.downloadEbookBlob(p._id, p.slug, ext).catch(() => toast.error("File sách không tồn tại."));
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                    Tải {p.specifications?.format || "Sách"}
                </button>
            )
        },
    ];

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>Quản lý eBook</h1>
                    <p className="text-muted-foreground text-sm mt-1">Thêm, sửa, xóa các sản phẩm eBook (PDF, EPUB)</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-pet-primary">
                    + Thêm eBook mới
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm eBook theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSearchTerm(searchQuery.trim());
                                setPage(1);
                            }
                        }}
                        className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40 focus:border-[var(--pet-coral)] transition-all shadow-sm"
                    />
                    <button
                        onClick={() => {
                            setSearchTerm(searchQuery.trim());
                            setPage(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--pet-coral)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all"
                    >
                        Tìm
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <DataTable
                    columns={columns}
                    data={ebooks}
                    loading={loading}
                    keyExtractor={(p) => p._id}
                    emptyText="Không có eBook nào."
                    actions={(p) => (
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => handleDelete(p._id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold">Xóa</button>
                        </div>
                    )}
                />
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-border">
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                    </div>
                )}
            </div>

            <EbookFormModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    loadEbooks();
                }} 
            />
        </div>
    );
};

export default EbookManagePage;
