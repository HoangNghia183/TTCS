import express from 'express';
import { checkCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin xem danh sách mã giảm giá
router.get('/', protectedRoute, adminRoute, getCoupons);
router.post('/', protectedRoute, adminRoute, createCoupon);
router.patch('/:id', protectedRoute, adminRoute, updateCoupon);
router.delete('/:id', protectedRoute, adminRoute, deleteCoupon);

// User check mã
router.post('/check', protectedRoute, checkCoupon);

// Admin quản lý mã (Bạn cần viết thêm controller CRUD cho phần này nếu muốn)
// router.route('/').post(protectedRoute, adminRoute, createCoupon);

export default router;
