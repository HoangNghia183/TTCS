import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { Ebook, EbookFilters } from "@/services/ebookService";
import { ebookService } from "@/services/ebookService";
import { useDebounce } from "@/hooks/useDebounce";
import ProductFilter from "@/components/features/product/ProductFilter";
import EbookList from "@/components/features/ebook/EbookList";
import Pagination from "@/components/common/Pagination";
import { PAGE_SIZE } from "@/utils/constants";

const ProductSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-border overflow-hidden bg-white dark:bg-card">
        <div className="bg-muted aspect-[3/4] w-full" />
        <div className="p-4 flex flex-col gap-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-5 bg-muted rounded w-1/3 mt-2" />
        </div>
    </div>
);

const EbookPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Initial filters from URL
    const initialFilters: EbookFilters = {
        page: parseInt(searchParams.get("page") || "1"),
        limit: PAGE_SIZE,
        search: searchParams.get("q") || undefined,
        category: searchParams.get("category") || undefined,
        sort: (searchParams.get("sort") as EbookFilters["sort"]) || "newest",
        minPrice: searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    };

    const [filters, setFilters] = useState<EbookFilters>(initialFilters);
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEbooks, setTotalEbooks] = useState(0);

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setFilters((prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }));
    };

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        const fetchEbooks = async () => {
            setIsLoading(true);
            try {
                const res = await ebookService.getEbooks(debouncedFilters);
                setEbooks(res.data);
                setTotalPages(res.totalPages);
                // The API doesn't return total count directly in PaginatedResponse right now, 
                // but we can just use length if we need to show a count, or skip it.
            } catch (error) {
                console.error("Failed to fetch ebooks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEbooks();

        // Sync URL params
        const newParams = new URLSearchParams();
        if (debouncedFilters.page && debouncedFilters.page > 1) newParams.set("page", debouncedFilters.page.toString());
        if (debouncedFilters.search) newParams.set("q", debouncedFilters.search);
        if (debouncedFilters.category) newParams.set("category", debouncedFilters.category);
        if (debouncedFilters.sort && debouncedFilters.sort !== "newest") newParams.set("sort", debouncedFilters.sort);
        if (debouncedFilters.minPrice !== undefined) newParams.set("minPrice", debouncedFilters.minPrice.toString());
        if (debouncedFilters.maxPrice !== undefined) newParams.set("maxPrice", debouncedFilters.maxPrice.toString());
        setSearchParams(newParams, { replace: true });
    }, [debouncedFilters, setSearchParams]);

    const handleFilterChange = (newFilters: Partial<EbookFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset page
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header / Breadcrumb */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Cửa Hàng eBook
                </h1>
                <p className="text-muted-foreground">Tải nghiệm đọc sách kỹ thuật số mọi lúc mọi nơi</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <input
                    type="text"
                    id="ebook-search"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Tìm kiếm tựa sách, tác giả eBook..."
                    className="w-full px-5 py-3 pl-12 rounded-2xl border border-border bg-white dark:bg-card text-sm
                     focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40 focus:border-[var(--pet-coral)] transition-all shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">🔍</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ── BỘ LỌC ── */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-24">
                        <ProductFilter filters={filters} onChange={handleFilterChange} />
                    </div>
                </aside>

                {/* ── DANH SÁCH EBOOK ── */}
                <div className="flex-1 min-w-0">


                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <EbookList ebooks={ebooks} title="" />

                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <Pagination
                                        currentPage={filters.page || 1}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EbookPage;
