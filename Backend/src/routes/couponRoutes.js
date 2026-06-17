import express from 'express';
import { checkCoupon, createCoupon, getAllCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User check mã
router.post('/check', protectedRoute, checkCoupon);

// Admin quản lý mã
router.get('/', protectedRoute, adminRoute, getAllCoupon);
router.post('/', protectedRoute, adminRoute, createCoupon);
router.put('/:id', protectedRoute, adminRoute, updateCoupon);
router.delete('/:id', protectedRoute, adminRoute, deleteCoupon);
router.post('/check',protectedRoute,checkCoupon)

export default router;