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

        res.json({ 
            valid: true, 
            discountAmount, 
            couponId: coupon._id 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllCoupon = async (req,res)=>{
    const {page=1,limit=10} = req.query;
    const coupons = await Coupon.find({})
        .skip(page*limit)
        .limit(limit);
    res.json({
        data:coupons,
        message:"list ma giam gia",
        success:true
    });
}
export const createCoupon = async (req,res) => {
    console.log(req.body);
    const { code,discountType,value,minOrderValue,expirationDate,usageLimit } = req.body;
    const formData = {
        code,discountType,value,minOrderValue,expirationDate,usagaLimit
    }
    // const created = Coupon.create(formData);
    res.json({message:"tạo thành công"});
}

    // code: { type: String, required: true, unique: true, uppercase: true },
    // discountType: { 
    //     type: String, 
    //     enum: ['percent', 'fixed'], 
    //     default: 'percent' 
    // }, 
    // value: { type: Number, required: true },
    // minOrderValue: { type: Number, default: 0 },
    // expirationDate: { type: Date, required: true },
    // usageLimit: { type: Number, default: 100 },
    // usedCount: { type: Number, default: 0 }