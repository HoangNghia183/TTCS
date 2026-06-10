import express from 'express';

import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminRoute } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const router = express.Router();

router.get(
    "/dashboard",
    protectedRoute,
    adminRoute,
    async (req, res) => {
        try {
            const users = await User.find({});
            const products = await Product.find({});
            const orders = await Order.find({ status: "Processing" });
            res.json({
                userLen: users.length,
                bookLen: products.length,
                orderLen: orders.length
            })
        } catch (er) {
            res.json({

            })
        }
    }
)
export default router;