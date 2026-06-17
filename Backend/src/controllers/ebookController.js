import Ebook from '../models/Ebook.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import path from 'path';
import fs from 'fs';
import APIFeatures from '../utils/apiFeatures.js';

// --- Giao diện chung ---

export const getEbooks = async (req, res, next) => {
    try {
        const query = { ...req.query };

        // Resolve category slug -> ObjectId
        if (query.category) {
            const cat = await Category.findOne({ slug: query.category }).select('_id');
            if (cat) {
                query.category = cat._id.toString();
            } else {
                // Category slug not found – return empty result
                return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, currentPage: 1, data: [] });
            }
        }

        const features = new APIFeatures(Ebook.find().populate('category', 'name slug'), query)
            .filter()
            .sort()
            .limitFields()
            .pagination();

        const ebooks = await features.query;

        // Count total for pagination
        const countFeatures = new APIFeatures(Ebook.find(), query).filter();
        const total = await countFeatures.query.countDocuments();

        res.status(200).json({
            success: true,
            count: ebooks.length,
            total,
            totalPages: Math.ceil(total / (query.limit || 12)),
            currentPage: query.page || 1,
            data: ebooks
        });
    } catch (error) {
        next(error);
    }
};

export const getEbookBySlug = async (req, res, next) => {
    try {
        const ebook = await Ebook.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { views: 1 } },
            { new: true }
        )
        .populate('category', 'name slug')
        .populate({
            path: 'reviews',
            options: { sort: { createdAt: -1 } },
            populate: { path: 'user', select: 'displayName username avatarUrl' },
        });

        if (!ebook) {
            return res.status(404).json({ message: 'Không tìm thấy eBook' });
        }

        const reviews = ebook.reviews || [];
        const reviewCount = reviews.length;
        const averageRating = reviewCount
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

        ebook.reviewCount = reviewCount;
        ebook.averageRating = averageRating;
        ebook.save({ validateBeforeSave: false }).catch(() => {});

        const responseEbook = ebook.toObject({ virtuals: true, flattenMaps: true });
        responseEbook.reviewCount = reviewCount;
        responseEbook.averageRating = averageRating;

        res.status(200).json(responseEbook);
    } catch (error) {
        next(error);
    }
};

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

export const createEbookReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const numericRating = Number(rating);

        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
        }

        if (!comment || !String(comment).trim()) {
            return res.status(400).json({ message: 'Review comment is required' });
        }

        const ebook = await Ebook.findById(req.params.id);

        if (!ebook) {
            return res.status(404).json({ message: 'Ebook not found' });
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            ebook: req.params.id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You already reviewed this ebook' });
        }

        const review = await Review.create({
            user: req.user._id,
            ebook: req.params.id,
            rating: numericRating,
            comment: String(comment).trim(),
            isPurchased: true // Assuming true for now, can add order check later
        });

        await recalculateEbookRating(ebook);
        await review.populate('user', 'displayName username avatarUrl');

        res.status(201).json({
            message: 'Review created successfully',
            review,
            averageRating: ebook.averageRating,
            reviewCount: ebook.reviewCount,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Giao diện Admin ---

export const createEbook = async (req, res, next) => {
    try {
        const { name, description, price, originalPrice, category, specifications } = req.body;
        
        let images = [];
        let pdfFile = '';

        if (req.files) {
            if (req.files['images']) {
                images = req.files['images'].map(file => `/uploads/${file.filename}`);
            }
            if (req.files['pdfFile']) {
                pdfFile = `/uploads/${req.files['pdfFile'][0].filename}`;
            }
        }

        if (!pdfFile) {
            return res.status(400).json({ message: 'Vui lòng tải lên file eBook (PDF hoặc EPUB)' });
        }

        const parsedSpecs = specifications ? JSON.parse(specifications) : {};

        const ebook = await Ebook.create({
            name,
            description,
            price,
            originalPrice,
            category,
            images,
            pdfFile,
            specifications: parsedSpecs
        });

        res.status(201).json(ebook);
    } catch (error) {
        next(error);
    }
};

export const updateEbook = async (req, res, next) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            return res.status(404).json({ message: 'Không tìm thấy eBook' });
        }

        let { images, pdfFile } = ebook;

        if (req.files) {
            if (req.files['images'] && req.files['images'].length > 0) {
                images = req.files['images'].map(file => `/uploads/${file.filename}`);
            }
            if (req.files['pdfFile'] && req.files['pdfFile'].length > 0) {
                pdfFile = `/uploads/${req.files['pdfFile'][0].filename}`;
            }
        }
        
        // Nếu client gửi mảng existingImages
        if (req.body.existingImages) {
            const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
            images = req.files && req.files['images'] ? [...existingImages, ...images] : existingImages;
        }

        const parsedSpecs = req.body.specifications ? JSON.parse(req.body.specifications) : ebook.specifications;

        const updatedEbook = await Ebook.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                images,
                pdfFile,
                specifications: parsedSpecs
            },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedEbook);
    } catch (error) {
        next(error);
    }
};

export const deleteEbook = async (req, res, next) => {
    try {
        const ebook = await Ebook.findByIdAndDelete(req.params.id);
        if (!ebook) {
            return res.status(404).json({ message: 'Không tìm thấy eBook' });
        }
        res.status(200).json({ message: 'Đã xóa eBook thành công' });
    } catch (error) {
        next(error);
    }
};

// --- Tính năng Tải xuống (Dành cho user đã mua) ---
export const downloadEbook = async (req, res, next) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            return res.status(404).json({ message: 'Không tìm thấy eBook' });
        }

        // Kiểm tra quyền mua: Có đơn hàng nào chứa eBook này, thanh toán thành công, của user hiện tại không
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            orderType: 'Ebook',
            'orderItems.product': ebook._id,
            isPaid: true
        });

        // Cho phép Admin tải không cần mua
        if (!hasPurchased && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chưa mua eBook này hoặc đơn hàng chưa thanh toán' });
        }

        // Đường dẫn thực tế tới file
        const filePath = path.join(process.cwd(), ebook.pdfFile);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File không tồn tại trên hệ thống' });
        }

        // Determine the actual file extension from the stored path
        const fileExt = path.extname(ebook.pdfFile).toLowerCase() || '.pdf'; // e.g. .epub or .pdf
        const downloadName = `${ebook.slug}${fileExt}`;

        res.download(filePath, downloadName);
    } catch (error) {
        next(error);
    }
};

// --- Các eBook người dùng đã mua ---
export const getMyEbooks = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            orderType: 'Ebook',
            isPaid: true
        }).select('orderItems.product createdAt');

        const ebookIds = orders.map(order => order.orderItems[0].product);

        const ebooks = await Ebook.find({ _id: { $in: ebookIds } }).select('name slug images category price pdfFile specifications');

        res.status(200).json({
            success: true,
            data: ebooks
        });
    } catch (error) {
        next(error);
    }
};
