import express from 'express';
import { 
    addOrderItems, 
    getAllOrders, 
    getMyOrders, 
    getOrderById,   
    setOrderStatus,
    // getOrders
    // getOrders (Admin)
} from '../controllers/orderController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// router.route('/all').get(protectedRoute,adminRoute,getAllOrders);
router.route('/').post(protectedRoute, addOrderItems);
router.route('/').get(protectedRoute,adminRoute,getAllOrders);
router.route('/my').get(protectedRoute, getMyOrders);
router.route('/:id').get(protectedRoute, getOrderById);
router.route('/:id/status').put(protectedRoute, adminRoute, setOrderStatus);



export default router;