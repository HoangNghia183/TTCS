import express from 'express';
import { protectedRoute, adminRoute } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import {
    getEbooks,
    getEbookBySlug,
    createEbook,
    updateEbook,
    deleteEbook,
    downloadEbook,
    getMyEbooks,
    createEbookReview
} from '../controllers/ebookController.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/', getEbooks);
router.get('/slug/:slug', getEbookBySlug);

// --- PROTECTED ROUTES (USER) ---
router.get('/my-ebooks', protectedRoute, getMyEbooks);
router.get('/:id/download', protectedRoute, downloadEbook);
router.post('/:id/reviews', protectedRoute, createEbookReview);

// --- ADMIN ROUTES ---
const cpUpload = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'pdfFile', maxCount: 1 }
]);

router.post('/', protectedRoute, adminRoute, cpUpload, createEbook);
router.put('/:id', protectedRoute, adminRoute, cpUpload, updateEbook);
router.delete('/:id', protectedRoute, adminRoute, deleteEbook);

export default router;
