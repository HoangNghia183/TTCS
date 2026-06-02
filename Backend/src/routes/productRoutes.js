import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    // updateProduct, // (Nếu bạn đã viết trong controller)
    deleteProduct, // (Nếu bạn đã viết trong controller)
    createProductReview,
    getOwnedBook,
    updateProduct
} from '../controllers/productController.js';
import uploadMemory from '../middlewares/memoryUpload.js'
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';
// import { createElement } from 'react';
// import upload from '../middlewares/uploadMiddleware.js'; // Nếu có upload ảnh

const router = express.Router();

router.route('/owned-book').get(protectedRoute, getOwnedBook)

// Public
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// User Review

router.route('/:id/reviews').post(protectedRoute, createProductReview);

// Admin Only
router.route('/').post(
    protectedRoute,
    adminRoute,
    uploadMemory.fields([
        { name: 'imgFile', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
    ]),
    createProduct
);
router.route('/').put(
    protectedRoute, 
    adminRoute, 
    uploadMemory.fields([
        { name: 'imgFile', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
    ]),
    updateProduct);
router.route('/:id').delete(protectedRoute, adminRoute, deleteProduct);

// router.post('/pdf', upload.single('pdfFile'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Không có file!' });
//     }
//     const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
//     const result = await cloudinary.uploader.upload(fileBase64, {
//       resource_type: 'raw',
//       folder: 'bookDLoad'
//     });

//     return res.status(200).json({ success: true, pdf_url: result.secure_url });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });



// router.route('/:id')
//     .put(protectedRoute, adminRoute, updateProduct)
//     .delete(protectedRoute, adminRoute, deleteProduct);

export default router;