import { useState } from "react";
import Sidebar from "@/components/common/Sidebar";
import { warrantyService } from "@/services/warrantyService";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const ISSUES = ["Sách bị hỏng", "Sản phẩm lỗi", "Giao hàng sai", "Chất lượng kém", "Khác"];

const WarrantyRequestPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ orderId: "", productId: "", productName: "", issue: ISSUES[0], description: "" });
    const [images, setImages] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40 focus:border-[var(--pet-coral)] transition-all placeholder:text-muted-foreground";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.orderId || !form.productName || !form.description) {
            toast.error("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        setSubmitting(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            images.forEach((img) => data.append("images", img));
            await warrantyService.createRequest(data);
            toast.success("Yêu cầu bảo hành đã được gửi!");
            navigate("/orders");
        } catch {
            toast.error("Không thể gửi yêu cầu. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
            <Sidebar mode="user" />
            <main className="flex-1">
                <h1 className="section-title mb-6">🛡️ Yêu Cầu Bảo Hành</h1>
                <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 max-w-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mã đơn hàng</label>
                                <input className={inputCls} placeholder="VD: abc123" value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên sản phẩm</label>
                                <input className={inputCls} placeholder="Tên sản phẩm cần bảo hành" value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Loại vấn đề</label>
                            <select className={inputCls} value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}>
                                {ISSUES.map((i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mô tả chi tiết</label>
                            <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Mô tả vấn đề bạn gặp phải..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ảnh minh chứng (tùy chọn)</label>
                            <input type="file" accept="image/*" multiple className="text-sm text-muted-foreground" onChange={(e) => setImages(Array.from(e.target.files ?? []))} />
                            {images.length > 0 && <p className="text-xs text-muted-foreground mt-1">{images.length} ảnh đã chọn</p>}
                        </div>
                        <div className="flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => navigate(-1)} className="btn-pet-secondary">Hủy</button>
                            <button type="submit" disabled={submitting} className="btn-pet-primary disabled:opacity-50">{submitting ? "Đang gửi..." : "Gửi yêu cầu"}</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default WarrantyRequestPage;