import { useState, useEffect, useCallback } from "react";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import DataTable, { type Column } from "@/components/features/admin/DataTable";
import Pagination from "@/components/common/Pagination";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

import ProductFormModal from "@/components/features/admin/ProductFormModal";

const ProductManagePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await productService.getAll({
                page,
                limit: 10,
                search: searchTerm || undefined
            });
            setProducts(res.data);
            setTotalPages(res.totalPages || 1);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        try {
            await productService.delete(id);
            toast.success("Đã xóa sản phẩm.");
            // Optimistic update — remove from local state immediately, then refresh
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error("Xóa thất bại. Vui lòng thử lại.");
        }
    };

    const columns: Column<Product>[] = [
        {
            key: "product", header: "Sản phẩm", render: (p) => (
                <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                    <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.author}</p>
                    </div>
                </div>
            )
        },
        { key: "category", header: "Loại", render: (p) => <span className="badge-new capitalize">{p.category}</span> },
        { key: "price", header: "Giá", render: (p) => <span className="font-bold text-[var(--pet-coral)]">{formatCurrency(p.price)}</span> },
        { key: "rating", header: "⭐", render: (p) => <span className="text-sm text-foreground">{p.rating.toFixed(1)} ({p.reviewCount})</span> },
        {
            key: "stock", header: "Tồn kho", render: (p) => (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {p.inStock ? "Còn hàng" : "Hết hàng"}
                </span>
            )
        },
    ];

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>Quản lý Sản phẩm</h1>
                    <p className="text-muted-foreground text-sm mt-1">Thêm, sửa, xóa thông tin sách</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-pet-primary">
                    + Thêm sách mới
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách theo tên..."
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
                    data={products}
                    loading={loading}
                    keyExtractor={(p) => p.id}
                    emptyText="Không có sản phẩm nào."
                    actions={(p) => (
                        <div className="flex gap-2 justify-end">
                            <button className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold">Sửa</button>
                            <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold">Xóa</button>
                        </div>
                    )}
                />
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-border">
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                    </div>
                )}
            </div>

            <ProductFormModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={loadProducts} 
            />
        </div>
    );
};

export default ProductManagePage;