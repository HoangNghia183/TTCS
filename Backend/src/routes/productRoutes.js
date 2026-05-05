import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    // updateProduct, // (Nếu bạn đã viết trong controller)
    deleteProduct, // (Nếu bạn đã viết trong controller)
    createProductReview, 
    getOwnedBook
} from '../controllers/productController.js';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';
// import { createElement } from 'react';
// import upload from '../middlewares/uploadMiddleware.js'; // Nếu có upload ảnh

const router = express.Router();

router.route('/owned-book').get(protectedRoute,getOwnedBook)

// Public
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// User Review

router.route('/:id/reviews').post(protectedRoute, createProductReview);

// Admin Only
router.route('/').post(protectedRoute, adminRoute, createProduct);

router.route('/:id').delete(protectedRoute,adminRoute,deleteProduct);


// router.route('/:id')
//     .put(protectedRoute, adminRoute, updateProduct)
//     .delete(protectedRoute, adminRoute, deleteProduct);

export default router;