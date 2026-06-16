import express from 'express';
import { 
    createWarrantyRequest, 
    getMyWarrantyRequests, 
    getAllWarrantyRequests, 
    updateWarrantyStatus 
} from '../controllers/warrantyController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// User
router.post('/', protectedRoute, upload.array('images', 5), createWarrantyRequest);
router.get('/my-requests', protectedRoute, getMyWarrantyRequests);

// Admin
router.get('/admin', protectedRoute, adminRoute, getAllWarrantyRequests);
router.put('/admin/:id', protectedRoute, adminRoute, updateWarrantyStatus);

export default router;