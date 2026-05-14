import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
export const addOrderItems = async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        discountAmount,
        couponCode,
    } = req.body;
    // console.log(req.body)
    // console.log(items);
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    try {
        // check coupon if provided
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) {
                return res.status(400).json({ message: 'Mã giảm giá không hợp lệ' });
            }
            // TODO: check if expired, usage limit, etc.
        }

        // check tồn kho trước
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product || product.stock < item.qty) {
                return res.status(400).json({
                    message: `Sản phẩm ${product ? product.name : item.product} không đủ hàng`
                });
            }
        }

        // tạo orderItems với thông tin sản phẩm
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            return {
                product: item.product,
                name: product.name,
                qty: item.qty,
                price: product.price,
                image: product.images[0] || ''
            };
        }));

        // tạo order
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            discountAmount: discountAmount || 0,
            coupon: coupon ? coupon._id : undefined,
        });

        const createdOrder = await order.save();

        // trừ kho
        for (const item of items) {
            const product = await Product.findById(item.product);

            product.stock -= item.qty;
            product.sold = (product.sold || 0) + item.qty;

            await product.save();
        }

        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy đơn hàng của tôi
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();

        res.json({
            data:orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết đơn hàng
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'fullName email');
        if (order) {
            // Kiểm tra quyền: Chỉ Admin hoặc Chủ đơn hàng mới được xem
            if(req.user.role === 'admin' || order.user._id.equals(req.user._id)){
                res.json(order);
            } else {
                res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
            }
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};