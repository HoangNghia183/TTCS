import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ebookService } from "@/services/ebookService";
import { categoryService, type DbCategory } from "@/services/categoryService";

interface EbookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EbookFormModal = ({ isOpen, onClose, onSuccess }: EbookFormModalProps) => {
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
    const [image, setImage] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            categoryService.getAll().then(res => setCategories(res)).catch(() => {});
            // Reset form
            setName("");
            setCategoryId("");
            setAuthor("");
            setPublisher("");
            setDescription("");
            setOriginalPrice("");
            setPrice("");
            setImage(null);
            setPdfFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !categoryId || !price || !pdfFile) {
            toast.error("Vui lòng điền các trường bắt buộc và tải lên file sách");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", categoryId);
        formData.append("description", description || "Chưa có mô tả");
        formData.append("price", price);
        if (originalPrice) formData.append("originalPrice", originalPrice);
        
        const specifications = JSON.stringify({
            author,
            publisher,
            format: pdfFile.name.endsWith('.epub') ? "EPUB" : "PDF"
        });
        formData.append("specifications", specifications);

        if (image) {
            formData.append("images", image);
        }
        
        formData.append("pdfFile", pdfFile);

        try {
            await ebookService.createEbook(formData);
            toast.success("Thêm eBook thành công!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi thêm eBook");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 sm:p-6 border-b border-border bg-muted/20 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-foreground">Thêm eBook mới</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="ebook-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Tên & Danh mục */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Tên eBook <span className="text-red-500">*</span></label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background" placeholder="VD: Đắc Nhân Tâm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Danh mục <span className="text-red-500">*</span></label>
                                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">File Sách (.pdf, .epub) <span className="text-red-500">*</span></label>
                                <input type="file" accept=".pdf,.epub" required onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Ảnh bìa</label>
                                <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
                            </div>
                        </div>

                        {/* Giá */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" min="0" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Giá gốc (VNĐ)</label>
                                <input type="number" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Tác giả</label>
                                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Nhà xuất bản</label>
                                <input type="text" value={publisher} onChange={e => setPublisher(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Mô tả</label>
                            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none" placeholder="Giới thiệu về nội dung sách..." />
                        </div>
                    </form>
                </div>

                <div className="p-4 sm:p-6 border-t border-border bg-muted/20 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors">
                        Hủy
                    </button>
                    <button type="submit" form="ebook-form" disabled={loading} className="btn-pet-primary px-6">
                        {loading ? "Đang xử lý..." : "Lưu eBook"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EbookFormModal;
