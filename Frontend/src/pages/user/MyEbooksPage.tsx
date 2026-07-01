import { useState, useEffect } from "react";
import { ebookService } from "@/services/ebookService";
import type { Ebook } from "@/services/ebookService";
import { Link } from "react-router";
import { getImageUrl } from "@/utils/format";
import Sidebar from "@/components/common/Sidebar";
import Loading from "@/components/common/Loading";

const MyEbooksPage = () => {
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyEbooks = async () => {
            try {
                const data = await ebookService.getMyEbooks();
                setEbooks(data);
            } catch (error) {
                console.error("Failed to fetch my ebooks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEbooks();
    }, []);

    const handleDownload = async (ebook: Ebook) => {
        // Determine correct extension from specifications.format field
        const formatField = ebook.specifications?.format?.toLowerCase() || '';
        const ext = formatField.includes('epub') ? 'epub' : formatField.includes('pdf') ? 'pdf' : 'pdf';

        setDownloadingId(ebook._id);
        try {
            await ebookService.downloadEbookBlob(ebook._id, ebook.slug, ext);
        } catch {
            alert("Không thể tải file, vui lòng thử lại sau.");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
            <Sidebar mode="user" />
            <main className="flex-1 min-w-0">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        eBook Của Tôi
                    </h1>
                    <p className="text-sm text-muted-foreground">Tài sản kỹ thuật số bạn đã mua</p>
                </div>

                {loading ? (
                    <Loading />
                ) : ebooks.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">

                        <h3 className="text-lg font-bold text-foreground mb-2">Bạn chưa mua eBook nào</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                            Hãy khám phá hàng ngàn tựa sách kỹ thuật số hấp dẫn tại Cửa hàng eBook của chúng tôi.
                        </p>
                        <Link to="/ebook" className="btn-pet-primary">Khám phá eBook</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {ebooks.map(ebook => {
                            const formatField = ebook.specifications?.format?.toLowerCase() || '';
                            const ext = formatField.includes('epub') ? 'EPUB' : 'PDF';
                            const isDownloading = downloadingId === ebook._id;

                            return (
                                <div key={ebook._id} className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <Link to={`/ebook/${ebook.slug}`}>
                                        <div className="aspect-[3/4] bg-muted/30 w-full overflow-hidden">
                                            <img
                                                src={getImageUrl(ebook.images?.[0])}
                                                alt={ebook.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    </Link>
                                    <div className="p-4 flex flex-col gap-3">
                                        <Link to={`/ebook/${ebook.slug}`}>
                                            <h3 className="font-bold text-sm leading-tight line-clamp-2 hover:text-blue-500 transition-colors">{ebook.name}</h3>
                                        </Link>
                                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md w-fit">
                                            {ext}
                                        </span>
                                        <button
                                            onClick={() => handleDownload(ebook)}
                                            disabled={isDownloading}
                                            className={`w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-auto
                                                ${isDownloading
                                                    ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                                }`}
                                        >
                                            {isDownloading ? (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            )}
                                            {isDownloading ? 'Đang tải...' : `Tải ${ext}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyEbooksPage;
