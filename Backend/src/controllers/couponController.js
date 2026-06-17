import Coupon from '../models/Coupon.js';

// @desc    Kiểm tra mã giảm giá
// @route   POST /api/coupons/check
export const checkCoupon = async (req, res) => {
    const { code, orderTotal } = req.body;

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
        }

        // Kiểm tra trạng thái
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Mã này đã bị vô hiệu hóa' });
        }

        // Kiểm tra hạn sử dụng
        if (new Date() > coupon.expirationDate) {
            return res.status(400).json({ message: 'Mã đã hết hạn' });
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderTotal < coupon.minOrderValue) {
            return res.status(400).json({ message: `Đơn hàng tối thiểu phải là ${coupon.minOrderValue}đ` });
        }

        // Kiểm tra số lượt dùng
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Mã đã hết lượt sử dụng' });
        }

        // Tính tiền giảm
        let discountAmount = 0;
        if (coupon.discountType === 'percent') {
            discountAmount = (orderTotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }
        coupon.usedCount += 1;
        coupon.save();
        res.json({
            valid: true,
            discountAmount,
            couponId: coupon._id
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách tất cả mã giảm giá
// @route   GET /api/coupons
export const getAllCoupon = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const coupons = await Coupon.find({})
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Coupon.countDocuments();

        res.json({
            data: coupons,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            message: "Danh sách mã giảm giá",
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// @desc    Tạo mã giảm giá
// @route   POST /api/coupons
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, value, minOrderValue, expirationDate, usageLimit } = req.body;

        // Validation
        if (!code || !value || !expirationDate) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin: code, value, expirationDate',
                success: false
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                message: 'Mã giảm giá này đã tồn tại',
                success: false
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType: discountType || 'percent',
            value,
            minOrderValue: minOrderValue || 0,
            expirationDate: new Date(expirationDate),
            usageLimit: usageLimit || 100,
            isActive: true
        });

        res.status(201).json({
            data: coupon,
            message: "Tạo mã giảm giá thành công",
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// @desc    Cập nhật mã giảm giá
// @route   PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Kiểm tra nếu cập nhật code thì phải kiểm tra xem code mới có tồn tại chưa
        if (updates.code) {
            const existingCoupon = await Coupon.findOne({
                code: updates.code.toUpperCase(),
                _id: { $ne: id }
            });
            if (existingCoupon) {
                return res.status(400).json({
                    message: 'Mã giảm giá này đã tồn tại',
                    success: false
                });
            }
            updates.code = updates.code.toUpperCase();
        }

        const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!coupon) {
            return res.status(404).json({
                message: 'Mã giảm giá không tồn tại',
                success: false
            });
        }

        res.json({
            data: coupon,
            message: "Cập nhật mã giảm giá thành công",
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// @desc    Xóa mã giảm giá
// @route   DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({
                message: 'Mã giảm giá không tồn tại',
                success: false
            });
        }

        res.json({
            message: "Xóa mã giảm giá thành công",
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};