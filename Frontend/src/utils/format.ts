export const formatCurrency = (amount: number): string =>
    amount.toLocaleString("vi-VN") + "₫";

export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatRelativeTime = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateStr);
};

export const truncate = (text: string, maxLength: number): string =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

export const calculateDiscountPercent = (price: number, originalPrice: number): number => {
    if (!originalPrice || price >= originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
};
export const getImageUrl = (url: string | undefined): string => {
    if (!url) return 'https://via.placeholder.com/300x400?text=No+Cover';
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace('/api', '');
    return baseUrl + url;
};

