import mongoose from "mongoose";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({
      user: req.user.id,
    });

    const lowStockCount = await Product.countDocuments({
      user: req.user.id,
      quantity: { $lte: 10 },
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

    res.status(200).json({
      totalProducts,
      lowStockCount,
      totalQuantity: totalStock[0]?.totalQuantity || 0,
      totalValue: totalStock[0]?.totalValue || 0,
      lowStockProducts: lowStockCount,
      totalStock: totalStock[0]?.totalQuantity || 0,
      inventoryValue: totalStock[0]?.totalValue || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};