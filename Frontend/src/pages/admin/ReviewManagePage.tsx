import { useEffect, useState } from "react";
import DataTable, { type Column } from "@/components/features/admin/DataTable";
import { formatDateISO } from "@/utils/format";
import { toast } from "sonner";
import { productService } from "@/services/productService";

interface AdminReview {
    _id: string;
    productName: string;
    username: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const ReviewManagePage = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    useEffect(()=>{
        loadData();
    },[])
    const loadData = async ()=>{
        const res = await productService.getReviewList();
        await setReviews(res.map((review:any) => {

            return {
                _id:review._id,
                productName:review.product.name,
                username:review.user.username,
                rating:review.rating,
                comment:review.comment,
                createdAt:formatDateISO(review.createdAt)
            }
        }));
    }
    const handleDelete = async (id: string) => {
        await productService.deleteReview(id);
        loadData();
        setReviews((prev) => prev.filter((r) => r._id !== id));
        toast.success("Đã xóa đánh giá.");
    };

    const columns: Column<AdminReview>[] = [
        { key: "product", header: "Sản phẩm", render: (r) => <span className="font-semibold text-sm text-foreground">{r.productName}</span> },
        { key: "user", header: "Người dùng", render: (r) => <span className="text-muted-foreground text-sm">{r.username}</span> },
        { key: "rating", header: "⭐", render: (r) => <span className="font-bold text-amber-500">{r.rating}/5</span> },
        { key: "comment", header: "Bình luận", render: (r) => <span className="text-foreground text-sm line-clamp-2 max-w-xs">{r.comment}</span> },
        { key: "time", header: "Thời gian", render: (r) => <span className="text-muted-foreground text-xs">{r.createdAt}</span> },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="section-title">⭐ Kiểm Duyệt Đánh Giá</h1>
            <DataTable
                columns={columns}
                data={reviews}
                keyExtractor={(r) => r._id}
                emptyText="Không có đánh giá nào."
                actions={(r) => <button onClick={() => handleDelete(r._id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold">Xóa spam</button>}
            />
        </div>
    );
};

export default ReviewManagePage;