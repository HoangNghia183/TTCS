import mongoose from 'mongoose';
import WarrantyRequest from '../models/WarrantyRequest.js';
import Order from '../models/Order.js';

// @desc    Gửi yêu cầu bảo hành (User)
// @route   POST /api/warranty
export const createWarrantyRequest = async (req, res) => {
    const { orderId, productName, issue, description } = req.body;
    const reason = `${issue}: ${description}`;

    try {
        let order;
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            order = await Order.findOne({ _id: orderId, user: req.user._id }).populate('orderItems.product');
        } else {
            const shortCode = String(orderId).trim().toUpperCase();
            if (shortCode.length === 8) {
                const userOrders = await Order.find({ user: req.user._id }).populate('orderItems.product');
                order = userOrders.find(o => o._id.toString().slice(-8).toUpperCase() === shortCode);
            }
        }

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc mã đơn hàng không hợp lệ.' });
        }

        // Tìm productId từ tên sản phẩm
        const orderItem = order.orderItems.find(item => 
            (item.product?.name && item.product.name.toLowerCase() === String(productName).toLowerCase()) ||
            (item.name && item.name.toLowerCase() === String(productName).toLowerCase())
        );

        if (!orderItem) {
            return res.status(400).json({ message: 'Sản phẩm không có trong đơn hàng này.' });
        }

        const productId = orderItem.product?._id || orderItem.product;

        // Kiểm tra xem đã có yêu cầu bảo hành nào cho sản phẩm này trong đơn hàng này chưa (tránh spam)
        const existingRequest = await WarrantyRequest.findOne({ 
            order: order._id, 
            product: productId 
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Bạn đã gửi yêu cầu bảo hành cho sản phẩm này rồi.' });
        }

        const uploadedImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const warrantyRequest = await WarrantyRequest.create({
            user: req.user._id,
            order: order._id,
            product: productId,
            reason,
            images: uploadedImages,
            status: 'Pending'
        });

        res.status(201).json(warrantyRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách yêu cầu bảo hành của tôi
// @route   GET /api/warranty/my-requests
export const getMyWarrantyRequests = async (req, res) => {
    try {
        const requests = await WarrantyRequest.find({ user: req.user._id })
            .populate('product', 'name image')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả yêu cầu bảo hành (Admin)
// @route   GET /api/warranty/admin
export const getAllWarrantyRequests = async (req, res) => {
    try {
        const requests = await WarrantyRequest.find({})
            .populate('user', 'displayName username email phone')
            .populate('product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật trạng thái bảo hành (Admin - Duyệt/Từ chối)
// @route   PUT /api/warranty/admin/:id
export const updateWarrantyStatus = async (req, res) => {
    const { status, adminResponse } = req.body; 
    // status: 'Approved', 'Rejected', 'Completed'

    try {
        const request = await WarrantyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }

        request.status = status;
        request.adminResponse = adminResponse || ''; // Ghi chú lý do nếu từ chối
        
        await request.save();

        // (Optional) Gửi email thông báo cho User tại đây
        // sendEmail(request.user.email, 'Cập nhật trạng thái bảo hành', ...)

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};