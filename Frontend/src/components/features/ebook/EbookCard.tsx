import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { ebookService } from "@/services/ebookService";
import type { Ebook } from "@/services/ebookService";
import { getImageUrl } from "@/utils/format";

interface EbookCardProps {
    ebook: Ebook;
}

const formatPrice = (price: number) =>
    price.toLocaleString("vi-VN") + "₫";

export const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        </div>
    );
};

const EbookCard = ({ ebook }: EbookCardProps) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [wishlisted, setWishlisted] = useState(false);
    const [buying, setBuying] = useState(false);

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Vui lòng đăng nhập để mua eBook!");
            navigate("/signin");
            return;
        }

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

    return (
        <article className="pet-card flex flex-col group h-full border border-blue-100 dark:border-blue-900/30">
            {/* ===== IMAGE ===== */}
            <div className="relative overflow-hidden aspect-[3/4] bg-muted/30">
                <Link to={`/ebook/${ebook.slug}`} className="block w-full h-full">
                    <img
                        src={getImageUrl(ebook.images?.[0])}
                        alt={ebook.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />

                    <div className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                        EBOOK
                    </div>
                </Link>

                {/* Wishlist */}
                <button
                    onClick={() => setWishlisted((p) => !p)}
                    aria-label="Yêu thích"
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
                     transition-all duration-200 hover:scale-110
                     ${wishlisted
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-white/90 dark:bg-card/90 text-muted-foreground hover:text-red-500 hover:bg-white"
                        }`}
                >
                    <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            {/* ===== BODY ===== */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                {/* Name */}
                <Link to={`/ebook/${ebook.slug}`}>
                    <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2 hover:text-blue-500 transition-colors duration-200"
                        style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {ebook.name}
                    </h3>
                </Link>

                {/* Author & Publisher */}
                <div className="h-4 mb-1">
                    {(ebook.specifications?.author || ebook.specifications?.publisher) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                            {ebook.specifications.author && <span className="truncate" title={ebook.specifications.author}>🏷️ {ebook.specifications.author}</span>}
                            {ebook.specifications.publisher && <><span className="opacity-40 flex-shrink-0">•</span><span className="truncate" title={ebook.specifications.publisher}>🏢 {ebook.specifications.publisher}</span></>}
                        </p>
                    )}
                </div>

                {/* Rating */}
                <StarRating rating={ebook.averageRating || 0} reviewCount={ebook.reviewCount || 0} />

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-auto pt-1">
                    <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                        {formatPrice(ebook.price)}
                    </span>
                    {ebook.originalPrice && ebook.originalPrice > ebook.price && (
                        <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(ebook.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleBuyNow}
                        disabled={buying}
                        className={`flex-1 justify-center text-xs py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all duration-200 text-white shadow-sm hover:-translate-y-0.5 ${buying ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {buying ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                        {buying ? "Đang xử lý..." : "Mua eBook"}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default EbookCard;
