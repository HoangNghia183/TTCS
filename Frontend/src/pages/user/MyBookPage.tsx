import { useEffect, useState } from "react";
import { Link } from "react-router";
import Sidebar from "@/components/common/Sidebar";
import { userService } from "@/services/userService";
import Loading from "@/components/common/Loading";

const MyBookPage = () => {
	const [ownedBook, setOwnedBook] = useState([]);
	const [loading, setLoading] = useState(true);
	const [downloadingId, setDownloadingId] = useState(null);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const bookList = await userService.getOwnedBook();
			setOwnedBook(bookList);
			console.log(bookList);
		} catch (error) {
			console.error(error);
			setOwnedBook([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadPdf = async (url: string, bookName: string, bookId: any) => {
		if (!url || downloadingId) return;
		setDownloadingId(bookId);

		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error("Không thể tải file");

			const rawBlob = await response.blob();
			const pdfBlob = new Blob([rawBlob], { type: "application/pdf" });
			const downloadUrl = URL.createObjectURL(pdfBlob);

			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = `${bookName.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`;

			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error("Lỗi khi tải sách:", error);
			alert("Có lỗi xảy ra khi tải file, vui lòng thử lại sau!");
		} finally {
			setDownloadingId(null);
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
			<Sidebar mode="user" />

			<main className="flex-1">
				<h1 className="section-title mb-6">📚 Sách đã mua</h1>

				{loading ? (
					<Loading />
				) : ownedBook.length === 0 ? (
					<div className="text-center py-16">
						<div className="text-5xl mb-3">📚</div>
						<p className="text-muted-foreground">Bạn chưa mua sách nào.</p>
						<Link to="/shop" className="btn-pet-primary mt-4 inline-flex">
							Khám phá sách
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4">
						{ownedBook.map((book: any) => {
							const currentId = book._id || book.id;
							const isThisDownloading = downloadingId === currentId;
							const hasDownloadLink = !!book.dLoadLink; // Kiểm tra xem sách có link tải không

							return (
								<article
									key={currentId}
									className="bg-white dark:bg-card rounded-3xl border border-border p-5 shadow-sm"
								>
									{/* Thêm flex và justify-between để đẩy nút tải về bên phải cùng */}
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

										{/* Phần thông tin bên trái (Ảnh + Tên) */}
										<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 w-full">
											<img
												src={book.images?.[0]}
												alt={book.name}
												className="w-full sm:w-24 h-24 object-cover rounded-2xl shrink-0"
											/>
											<div className="flex-1">
												{hasDownloadLink ? (
													// Nếu có link: Hiển thị dạng nút bấm tải
													<button
														onClick={() => handleDownloadPdf(book.dLoadLink, book.name, currentId)}
														disabled={downloadingId !== null}
														className={`text-left text-lg font-semibold block ${isThisDownloading
																? "text-muted-foreground cursor-wait"
																: "text-foreground hover:text-[var(--pet-coral)]"
															}`}
													>
														{book.name} {isThisDownloading && "⏳ (Đang tải...)"}
													</button>
												) : (
													// Nếu không có link: Chỉ hiển thị chữ tiêu đề thường, không click được
													<h2 className="text-lg font-semibold text-foreground">
														{book.name}
													</h2>
												)}
												<p className="text-sm text-muted-foreground mt-1">Sách đã mua</p>
											</div>
										</div>

										{/* Phần nút tải bên phải cùng - Chỉ hiển thị khi có link tải */}
										{hasDownloadLink && (
											<div className="w-full sm:w-auto shrink-0 flex justify-end">
												<button
													onClick={() => handleDownloadPdf(book.dLoadLink, book.name, currentId)}
													disabled={downloadingId !== null}
													className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
												>
													{isThisDownloading ? "Đang xử lý..." : (
														<>
															<span>📥</span> Tải bản PDF
														</>
													)}
												</button>
											</div>
										)}

									</div>
								</article>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
};

export default MyBookPage;