import { useState, useEffect } from "react";
import { toast } from "sonner";
import { productService } from "@/services/productService";
import { categoryService, type DbCategory } from "@/services/categoryService";

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProductFormModal = ({ isOpen, onClose, onSuccess }: ProductFormModalProps) => {
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [author, setAuthor] = useState("");
    const [publisher, setPublisher] = useState("");
    const [description, setDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            categoryService.getAll().then(setCategories).catch(() => toast.error("Lỗi lấy danh mục"));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !categoryId || !price || !stock || !description) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (kể cả Mô tả).");
            return;
        }

        setLoading(true);
        try {
            const payload: any = {};
            payload.name = name;
            payload.category = categoryId;
            payload.description = description;
            payload.price = Number(price);
            if (originalPrice) payload.originalPrice = Number(originalPrice);
            payload.stock = Number(stock);
            
            // Map author back to specifications map
            const specifications = { author, publisher };
            payload.specifications = specifications;
            
            if (image) {
                payload.images = ["/dummy.png"]; // TODO: implement local upload
            }

            await productService.create(payload);
            toast.success("Thêm sản phẩm thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Backend error:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || "Lỗi khi thêm sản phẩm.";
            toast.error("Lỗi: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white dark:bg-card z-10">
                    <h2 className="text-xl font-bold font-display text-foreground">Thêm Sản Phẩm Mới</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Tên sách <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="Nhập tên sách"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Thể loại <span className="text-red-500">*</span></label>
                            <select 
                                required
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                            >
                                <option value="">-- Chọn thể loại --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Tác giả</label>
                            <input 
                                type="text" 
                                value={author} 
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="Tên tác giả"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Nhà xuất bản</label>
                            <input 
                                type="text" 
                                value={publisher} 
                                onChange={(e) => setPublisher(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="Tên NXB"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Tồn kho <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={stock} 
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="Số lượng"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Giá gốc</label>
                            <input 
                                type="number" 
                                min="0"
                                value={originalPrice} 
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="VD: 150000"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-foreground">Giá bán <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]"
                                placeholder="VD: 120000"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground">Mô tả <span className="text-red-500">*</span></label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)] resize-none"
                            placeholder="Mô tả sách..."
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground">Ảnh sản phẩm</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="w-full px-4 py-2 rounded-xl border border-border bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--pet-coral)]/10 file:text-[var(--pet-coral)] hover:file:bg-[var(--pet-coral)]/20"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-pet-primary rounded-xl px-6"
                        >
                            {loading ? "Đang xử lý..." : "Lưu Sản Phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
