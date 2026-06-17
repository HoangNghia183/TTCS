import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Ebook from '../models/Ebook.js';

const recalculateEbookRating = async (ebookId) => {
    const reviews = await Review.find({ ebook: ebookId });
    await Ebook.findByIdAndUpdate(
        ebookId,
        {
            reviewCount: reviews.length,
            averageRating: reviews.length
                ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
                : 0,
        },
        { runValidators: false },
    );
};

const recalculateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });
    await Product.findByIdAndUpdate(
        productId,
        {
            reviewCount: reviews.length,
            averageRating: reviews.length
                ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
                : 0,
        },
        { runValidators: false },
    );
};

// @desc    Lấy tất cả đánh giá (Admin - Để kiểm duyệt)
// @route   GET /api/reviews
export const getAllReviews = async (req, res) => {
    try {
        // Populate để biết ai viết và viết cho sản phẩm nào
        const reviews = await Review.find({})
            .populate('user', 'displayName username email')
            .populate('product', 'name')
            .populate('ebook', 'name')
            .sort({ createdAt: -1 }); // Mới nhất lên đầu
            
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa đánh giá (Admin - Xóa spam/tục tĩu)
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        const productId = review.product;
        const ebookId = review.ebook;
        await review.deleteOne();
        if (productId) await recalculateProductRating(productId);
        if (ebookId) await recalculateEbookRating(ebookId);

        res.json({ message: 'Đã xóa đánh giá vi phạm' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
