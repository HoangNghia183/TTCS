import { useSearchParams, Link } from "react-router";

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();

    const status = searchParams.get("status");
    const code = searchParams.get("code");
    const orderId = searchParams.get("orderId");

    const isSuccess = status === "success";

    return (
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <div className="text-7xl mb-6">{isSuccess ? "🎉" : "😢"}</div>
            <h1
                className={`text-3xl font-black mb-3 ${isSuccess ? "text-emerald-600" : "text-red-500"}`}
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-muted-foreground mb-8">
                {isSuccess ? "Đơn hàng của bạn đã được thanh toán thành công." : `Lỗi thanh toán: ${code || "Không xác định"}`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {orderId && (
                    <Link to={`/orders/${orderId}`} className="btn-pet-primary">
                        📦 Xem đơn hàng
                    </Link>
                )}
                <Link to="/" className="btn-pet-secondary">🏠 Về trang chủ</Link>
            </div>
        </div>
    );
};

export default PaymentResultPage;
