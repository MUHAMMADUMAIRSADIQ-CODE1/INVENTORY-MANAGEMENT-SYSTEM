import mongoose from "mongoose";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({
      user: req.user.id,
    });

    const lowStockProducts = await Product.countDocuments({
      user: req.user.id,
      $or: [
        { quantity: { $lte: 10 } },
        { status: "Low Stock" },
      ],
    });

    const outOfStockProducts = await Product.countDocuments({
      user: req.user.id,
      status: "Out Of Stock",
    });

    const totalStock = await Product.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalValue: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
        },
      },
    ]);

    const totalSalesCount = await Sale.countDocuments({ user: req.user.id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSales = await Sale.countDocuments({
      user: req.user.id,
      saleDate: { $gte: today, $lt: tomorrow },
    });

    const monthlySales = await Sale.countDocuments({
      user: req.user.id,
      saleDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const revenueAgg = await Sale.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const recentSales = await Sale.find({ user: req.user.id })
      .sort({ saleDate: -1 })
      .limit(5);

    const recentProducts = await Product.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalProducts,
      totalInventoryQuantity: totalStock[0]?.totalQuantity || 0,
      totalSalesCount,
      todaysSales,
      monthlySales,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      lowStockProducts,
      outOfStockProducts,
      recentSales,
      recentProducts,
      lowStockCount: lowStockProducts,
      totalQuantity: totalStock[0]?.totalQuantity || 0,
      totalValue: totalStock[0]?.totalValue || 0,
      totalStock: totalStock[0]?.totalQuantity || 0,
      inventoryValue: totalStock[0]?.totalValue || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};