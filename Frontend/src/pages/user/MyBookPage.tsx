import { useEffect, useState } from "react";
import { Link } from "react-router";
import Sidebar from "@/components/common/Sidebar";
import { userService } from "@/services/userService";
import Loading from "@/components/common/Loading";

const MyBookPage = () => {
    const [ownedBook, setOwnedBook] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const bookList = await userService.getOwnedBook();
            setOwnedBook(bookList);
        } catch (error) {
            console.error(error);
            setOwnedBook([]);
        } finally {
            setLoading(false);
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
                        {ownedBook.map((book: any) => (
                            <article
                                key={book._id || book.id}
                                className="bg-white dark:bg-card rounded-3xl border border-border p-5 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <img
                                        src={book.images?.[0]}
                                        alt={book.name}
                                        className="w-full sm:w-40 h-40 object-cover rounded-3xl shrink-0"
                                    />
                                    <div className="flex-1">
                                        {/* Link download */}
                                        <Link
                                            to={`/product/${book._id}`}
                                            className="text-lg font-semibold text-foreground hover:text-[var(--pet-coral)]"
                                        >
                                            {book.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground mt-3">Sách đã mua</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookPage;
