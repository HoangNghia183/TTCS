import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    getAllUsers, 
    deleteUser,
    blockUser,
    unblockUser,
    test
} from '../controllers/userController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User Routes
router.route('/profile')
    .get(protectedRoute, getUserProfile)
    .put(protectedRoute, updateUserProfile);

// Admin Routes
router.route('/')
    .get(protectedRoute, adminRoute, getAllUsers);

router.route('/:id')
    .delete(protectedRoute, adminRoute, deleteUser);

router.route('/:id/block')
    .put(protectedRoute, adminRoute, blockUser);

router.route('/:id/unblock')
    .put(protectedRoute, adminRoute, unblockUser);
    
router.get('/test', test);

export default router;