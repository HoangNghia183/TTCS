import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ebookService } from "@/services/ebookService";
import type { Ebook } from "@/services/ebookService";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCurrency, getImageUrl } from "@/utils/format";
import { StarRating } from "@/components/features/ebook/EbookCard";
import { toast } from "sonner";
import ProductReviews from "@/components/features/product/ProductReviews";

const DetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="flex gap-2 mb-6">
            {[80, 20, 140].map((w, i) => (
                <div key={i} className="h-3 bg-muted rounded" style={{ width: `${w}px` }} />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-muted rounded-3xl aspect-[3/4] w-full max-w-md mx-auto" />
            <div className="flex flex-col gap-4">
                <div className="h-5 bg-muted rounded w-1/4" />
                <div className="h-9 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-12 bg-muted rounded-2xl" />
            </div>
        </div>
    </div>
);

const EbookDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [ebook, setEbook] = useState<Ebook | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEbook = async () => {
            setLoading(true);
            try {
                if (!slug) return;
                const data = await ebookService.getEbookBySlug(slug);
                setEbook(data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || "Không thể tải thông tin eBook");
            } finally {
                setLoading(false);
            }
        };

        fetchEbook();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleBuyNow = async () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để mua eBook!");
            navigate("/signin");
            return;
        }

        if (!ebook) return;

        setBuying(true);
        try {
            const { paymentUrl } = await ebookService.buyEbookDirectly(ebook._id);
            if (paymentUrl) {
                window.location.href = paymentUrl;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tạo đơn hàng, vui lòng thử lại sau.");
            setBuying(false);
        }
    };

    if (loading) return <DetailSkeleton />;

    if (error || !ebook) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-foreground mb-4">{error || "Không tìm thấy eBook"}</h1>
                <Link to="/ebook" className="btn-pet-primary">Về Cửa hàng eBook</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
                <Link to="/" className="hover:text-blue-500 transition-colors">Trang chủ</Link>
                <span className="mx-2 opacity-50">/</span>
                <Link to="/ebook" className="hover:text-blue-500 transition-colors">eBook</Link>
                <span className="mx-2 opacity-50">/</span>
                <Link to={`/ebook?category=${ebook.category?.slug}`} className="hover:text-blue-500 transition-colors">
                    {ebook.category?.name}
                </Link>
                <span className="mx-2 opacity-50">/</span>
                <span className="text-foreground font-medium truncate">{ebook.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                {/* ── IMAGE SECTION ── */}
                <div className="col-span-1 lg:col-span-5 relative">
                    <div className="aspect-[3/4] bg-muted/30 rounded-3xl overflow-hidden border border-border shadow-sm sticky top-24">
                        <img
                            src={getImageUrl(ebook.images?.[0])}
                            alt={ebook.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm">
                            EBOOK KỸ THUẬT SỐ
                        </div>
                    </div>
                </div>

                {/* ── INFO SECTION ── */}
                <div className="col-span-1 lg:col-span-7 flex flex-col pt-2">
                    {/* Category Label */}
                    <Link to={`/ebook?category=${ebook.category?.slug}`} className="text-sm font-bold text-blue-500 mb-3 w-fit hover:underline uppercase tracking-wider">
                        {ebook.category?.name}
                    </Link>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-[1.1]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {ebook.name}
                    </h1>

                    {/* Author & Publisher & Format */}
                    {(ebook.specifications?.author || ebook.specifications?.publisher || ebook.specifications?.format) && (
                        <p className="text-muted-foreground text-sm mb-4 flex flex-wrap items-center gap-3">
                            {ebook.specifications.author && <span>📖 Tác giả: <strong>{ebook.specifications.author}</strong></span>}
                            {ebook.specifications.publisher && <span>🏢 NXB: <strong>{ebook.specifications.publisher}</strong></span>}
                            {ebook.specifications.format && <span>📄 Định dạng: <strong>{ebook.specifications.format}</strong></span>}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                        <StarRating rating={ebook.averageRating || 0} reviewCount={ebook.reviewCount || 0} />
                    </div>

                    {/* Price Block */}
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 mb-8">
                        <div className="flex items-baseline gap-4 mb-2">
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                {formatCurrency(ebook.price)}
                            </span>
                            {ebook.originalPrice && ebook.originalPrice > ebook.price && (
                                <span className="text-lg text-muted-foreground line-through font-medium">
                                    {formatCurrency(ebook.originalPrice)}
                                </span>
                            )}
                        </div>
                        {ebook.originalPrice && ebook.originalPrice > ebook.price && (
                            <div className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-md">
                                <span>Tiết kiệm {Math.round((1 - ebook.price / ebook.originalPrice) * 100)}%</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-10">
                        <button
                            onClick={handleBuyNow}
                            disabled={buying}
                            className={`flex-1 justify-center py-4 rounded-2xl font-bold text-lg
                            flex items-center gap-2 transition-all duration-300
                            ${buying ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/30"} text-white`}
                        >
                            {buying ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Mua Ngay với VNPay
                                </>
                            )}
                        </button>
                    </div>

                    {/* Specs / Info */}
                    {ebook.specifications && Object.keys(ebook.specifications).length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-6 mb-10">
                            <h3 className="font-bold text-foreground mb-4">Thông tin eBook</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                {Object.entries(ebook.specifications).map(([key, val]) => {
                                    const labels: Record<string, string> = {
                                        author: "Tác giả",
                                        publisher: "Nhà xuất bản",
                                        pages: "Số trang",
                                        language: "Ngôn ngữ",
                                        format: "Định dạng",
                                    };
                                    return (
                                        <div key={key} className="flex justify-between sm:justify-start gap-2 text-sm border-b border-border sm:border-0 pb-2 sm:pb-0">
                                            <span className="text-muted-foreground w-28 shrink-0">{labels[key] || key}:</span>
                                            <span className="font-medium text-foreground text-right sm:text-left">{val}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Mô tả nội dung</h3>
                        <div
                            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-500"
                            dangerouslySetInnerHTML={{ __html: ebook.description || "" }}
                        />
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-16 border-t border-border pt-8">
                <ProductReviews 
                    itemId={ebook._id} 
                    reviews={(ebook as any).reviews || []} 
                    averageRating={ebook.averageRating}
                    onReviewAdded={() => {
                        ebookService.getEbookBySlug(slug!).then(setEbook).catch(() => {});
                    }}
                    onSubmit={ebookService.submitReview}
                />
            </div>
        </div>
    );
};

export default EbookDetailPage;
