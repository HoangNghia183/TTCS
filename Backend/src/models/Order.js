import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    orderType: {
        type: String,
        enum: ['Physical', 'Ebook'],
        default: 'Physical'
    },
    orderItems: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            refPath: 'orderItems.itemModel',
            required: true 
        },
        itemModel: {
            type: String,
            required: true,
            enum: ['Product', 'Ebook'],
            default: 'Product'
        },
        name: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }
    }],
    shippingAddress: {
        address: { type: String, required: function() { return this.orderType !== 'Ebook'; } },
        city: { type: String, required: function() { return this.orderType !== 'Ebook'; } },
        phone: { type: String, required: function() { return this.orderType !== 'Ebook'; } }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    statusHistory: [{
        status: { type: String, required: true },
        note: { type: String },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedByRole: { type: String, enum: ['customer', 'admin', 'system'], default: 'system' }
    }],
    cancelRequested: { type: Boolean, default: false },
    cancelReason: { type: String },
    cancelRequestedAt: { type: Date },
    cancelStatus: { 
        type: String, 
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    cancelResolvedAt: { type: Date },
    cancelRejectionReason: { type: String },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);