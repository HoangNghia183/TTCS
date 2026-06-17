import { Link } from "react-router";
import type { Ebook } from "@/services/ebookService";
import EbookCard from "./EbookCard";

interface EbookListProps {
    ebooks: Ebook[];
    title: string;
    subtitle?: string;
    viewAllLink?: string;
}

const EbookList = ({ ebooks, title, subtitle, viewAllLink }: EbookListProps) => {
    if (ebooks.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-4">📚</div>
                <p className="font-semibold">Không tìm thấy sản phẩm nào.</p>
            </div>
        );
    }

    return (
        <section className="py-8">
            {title && (
                <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4 border-b border-border pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            <span className="text-3xl">📘</span> {title}
                        </h2>
                        {subtitle && <p className="text-sm text-muted-foreground mt-1.5 ml-1">{subtitle}</p>}
                    </div>
                    {viewAllLink && (
                        <Link
                            to={viewAllLink}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
                        >
                            Xem tất cả
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {ebooks.map((ebook, idx) => (
                    <div key={ebook._id} className="animate-fade-in-up h-full" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <EbookCard ebook={ebook} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EbookList;
