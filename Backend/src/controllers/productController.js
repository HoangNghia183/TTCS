import Product from '../models/Product.js';
import Review from '../models/Review.js'; // Nhớ import Review Model
import APIFeatures from '../utils/apiFeatures.js';
import OwnedBook from '../models/OwnedBook.js';
import { cloudinary } from '../config/cloudinary.js';
import Category from '../models/Category.js'
import { getEmbedding } from '../utils/embed.js'
import { text } from 'express';
// @desc    Lấy tất cả sản phẩm (Có lọc nâng cao, sort, phân trang)
// @route   GET /api/products

export const getProducts = async (req, res) => {
    try {
        // Sử dụng APIFeatures để xử lý query params
        // VD: ?keyword=meo&price[gte]=100000&sort=-price&page=1
        const features = new APIFeatures(Product.find().populate("category"), req.query)
            .search()  // Tìm theo tên
            .filter()  // Lọc theo giá, danh mục...
            .sort()    // Sắp xếp
            .limitFields()
            .pagination();

        // Thực thi query
        const products = await features.query;

        // Đếm tổng số lượng (để frontend biết bao nhiêu trang)
        // Lưu ý: countDocuments độc lập để đếm chính xác
        // Use getFilter() — _conditions is a Mongoose internal not available in v7+
        const totalProducts = await Product.countDocuments(features.query.getFilter());

        res.json({
            products,
            page: Number(req.query.page) || 1,
            pages: Math.ceil(totalProducts / (Number(req.query.limit) || 10)),
            total: totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết 1 sản phẩm
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug'); // Lấy cả tên danh mục

        if (product) {
            // Tăng lượt xem — fire-and-forget (không block response nếu save lỗi)
            product.views = (product.views || 0) + 1;
            product.save({ validateBeforeSave: false }).catch(() => { });

            // Gợi ý thêm: Lấy các review của sản phẩm này trả về luôn
            // const reviews = await Review.find({ product: req.params.id }).populate('user', 'fullName avatar');

            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo đánh giá sản phẩm (Sửa lỗi logic cũ)
// @route   POST /api/products/:id/reviews
export const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // 1. Kiểm tra xem user đã review sản phẩm này chưa
            const alreadyReviewed = await Review.findOne({
                user: req.user._id,
                product: req.params.id
            });

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
            }

            // 2. Tạo Review mới trong bảng Review 
            await Review.create({
                user: req.user._id,
                product: req.params.id,
                rating: Number(rating),
                comment,
                isPurchased: true // Giả sử middleware check mua hàng đã chạy trước đó
            });

            // 3. Tính toán lại rating trung bình cho Product
            // Lấy tất cả review của sản phẩm này để tính chính xác nhất
            const reviews = await Review.find({ product: req.params.id });

            product.reviewCount = reviews.length;
            product.averageRating =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

            await product.save();

            res.status(201).json({ message: 'Đánh giá thành công' });
        } else {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const generateSlug = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
        .replace(/[đĐ]/g, 'd')           // Chuyển đ, Đ thành d
        .replace(/[^a-z0-9 ]/g, '')     // Xóa ký tự đặc biệt
        .trim()
        .replace(/\s+/g, '-');          // Đổi khoảng trắng thành gạch ngang
};

const parseSpecifications = (specString) => {
    if (!specString || typeof specString !== 'string') return {};

    return specString.split(/\r?\n/).reduce((acc, line) => {
        const [key, ...val] = line.split(':');
        if (key && val.length) {
            acc[key.trim()] = val.join(':').trim();
        }
        return acc;
    }, {});
};

const uploadProductImage = async (file) => {
    if (!file || !file.buffer) return null;

    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'imgBook',
        resource_type: 'image'
    });

    return result.secure_url || result.url;
};

const uploadProductFile = async (file) => {
    if (!file || !file.buffer) return null;

    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'bookDLoad',
        resource_type: 'raw'
    });

    return result.secure_url || result.url;
};

export const createProduct = async (req, res) => {
    try {
        let {
            name, price, stock, description, category, specifications,
            newCategoryName = "", newCategoryDescription = ""
        } = req.body;
        console.log(req.body);
        // 1. Validate dữ liệu đầu vào bắt buộc
        if (!name || !price) {
            return res.status(400).json({ message: 'Tên sản phẩm và giá là bắt buộc' });
        }
        const textToEmbed = `
            tên sách: ${name}.
            mô tả: ${description}.
            thể loại: ${category}.

        `
        const vectorEmbed = await getEmbedding(textToEmbed);
        // 2. Xử lý chuẩn hóa dữ liệu bằng helper
        const parsedSpecs = parseSpecifications(specifications);
        const productSlug = generateSlug(name);

        const productData = {
            name,
            slug: productSlug,
            price: Number(price),
            originPrice: price,
            stock: stock ? Number(stock) : 0,
            description,
            category,
            user: req.user._id,
            specifications: parsedSpecs,
            embedding:vectorEmbed
        };

        // 3. Xử lý tạo Danh mục mới nếu có
        if (category === "" && newCategoryName) {
            const catSlug = generateSlug(newCategoryName);

            let existingCat = await Category.findOne({ name: newCategoryName });
            if (!existingCat) {
                existingCat = await Category.create({
                    name: newCategoryName,
                    slug: catSlug,
                    description: newCategoryDescription
                });
            }
            productData.category = existingCat._id;
        }

        // 4. Xử lý Upload Files sử dụng 2 hàm riêng biệt
        const files = req.files || {};

        // Upload hình ảnh sản phẩm
        if (files.imgFile?.[0]) {
            try {
                const imgUrl = await uploadProductImage(files.imgFile[0]);
                if (imgUrl) productData.images = [imgUrl];
            } catch (imgErr) {
                return res.status(400).json({ message: `Image upload failed: ${imgErr.message}` });
            }
        }

        // Upload file sách (Tài liệu download)
        if (files.bookFile?.[0]) {
            try {
                const bookUrl = await uploadProductFile(files.bookFile[0]);
                if (bookUrl) productData.dLoadLink = bookUrl;
            } catch (bookErr) {
                return res.status(400).json({ message: `Book file upload failed: ${bookErr.message}` });
            }
        }

        // 5. Lưu vào Database và phản hồi client
        const product = new Product(productData);
        const createdProduct = await product.save();

        return res.status(201).json(createdProduct);

    } catch (error) {
        console.error('❌ Create product error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({ message: error.message });
    }
};
// @desc    Cập nhật sản phẩm (Admin) - (MỚI)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            stock,
            description,
            category,
            specifications,
            newCategoryName = "",
            newCategoryDescription = "",
            imgFile,
            bookFile
        } = req.body;
        // console.log(req.body);
        const oldProduct = await Product.findById(req.params.id).populate('category');
        if (!oldProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        let embedForm = {
            category:oldProduct.category.name
        }

        const parsedSpecs = parseSpecifications(specifications);
        const productSlug = generateSlug(name || oldProduct.name);

        const productData = {
            name: name ?? oldProduct.name,
            slug: productSlug,
            price: Number(price),
            originPrice: price,
            stock: stock ? Number(stock) : 0,
            description,
            category,
            user: req.user._id,
            specifications: parsedSpecs,
            // embedding:vectorEmbed
        };

        if (category === "" && newCategoryName) {
            const catSlug = generateSlug(newCategoryName);

            let existingCat = await Category.findOne({ name: newCategoryName });
            if (!existingCat) {
                existingCat = await Category.create({
                    name: newCategoryName,
                    slug: catSlug,
                    description: newCategoryDescription
                });
            }
            embedForm.category = existingCat.name;
            productData.category = existingCat._id;
        }
        

        if (imgFile) {
            productData.images = Array.isArray(imgFile) ? imgFile : [imgFile];
        } else if (req.files?.imgFile?.[0]) {
            const imgUrl = await uploadProductImage(req.files.imgFile[0]);
            if (imgUrl) productData.images = [imgUrl];
        } else {
            productData.images = oldProduct.images;
        }

        if (bookFile) {
            productData.dLoadLink = bookFile;
        } else if (req.files?.bookFile?.[0]) {
            const bookUrl = await uploadProductFile(req.files.bookFile[0]);
            if (bookUrl) productData.dLoadLink = bookUrl;
        } else {
            productData.dLoadLink = oldProduct.dLoadLink;
        }
        embedForm = {
            ...embedForm,
            product:name,
            description,
        }
        console.log(embedForm);
        const textToEmbed = `
            tên sách: ${embedForm.product}.
            mô tả: ${description}.
            thể loại: ${embedForm.category}.
        `
        const vectorEmbed = await getEmbedding(textToEmbed);
        productData.embedding = vectorEmbed;
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, productData, {
            new: true,
            runValidators: true
        });
        res.json(updatedProduct);

    } catch (error) {
        console.error('❌ Update product error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa sản phẩm (Admin) - (MỚI)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne(); // Dùng deleteOne thay vì remove (cũ)
            res.json({ message: 'Sản phẩm đã được xóa' });
        } else {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOwnedBook = async (req, res) => {
    try {
        const bookList = await OwnedBook.findOne({ userId: req.user._id }).populate('userId').populate('myBooks');
        res.json(bookList.myBooks);
    } catch (er) {
        res.status(404).json({ error: er.message });
    }
}