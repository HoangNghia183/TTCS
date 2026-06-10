import express from 'express';
import { formatDate2 } from '../utils/formatMoney.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminRoute } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const router = express.Router();

router.get("/dashboard",
    protectedRoute,
    adminRoute,
    async (req, res) => {
        try {
            const users = await User.find({});
            const products = await Product.find({});
            const orders = await Order.find({ status: "Processing" });
            const now = new Date();
            const startMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )
            const endMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                1
            )
            const revenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startMonth,
                            $lte: endMonth
                        },
                        status: "Delivered"
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: {
                            $sum: "$totalPrice"
                        }
                    }
                }
            ])
            res.json({
                revenue: revenue[0].revenue,
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
router.get('/revenue',
    // protectedRoute,
    // adminRoute,
    async (req, res) => {
        let { beginDay, endDay } = req.query;
        const now = new Date();
        // console.log(now.getDay());
        console.log("begin ", beginDay);
        console.log("end ", endDay);
        if (!beginDay) {
            beginDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }
        if (!endDay) {
            endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        beginDay = formatDate2(beginDay);
        endDay = formatDate2(endDay);
        console.log("begin ", beginDay);
        console.log("end ", endDay);
        const revenueMonth = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: beginDay,
                        $lte: endDay
                    },
                    status: "Delivered"
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ])
        const revenueDaily = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: beginDay,
                        $lte: endDay
                    },
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    total: {
                        $sum: "$totalPrice"
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
        res.json({
            revenueMonth: revenueMonth[0]?.total ?? 0,
            revenueDaily: revenueDaily
        })
    }
)
export default router;