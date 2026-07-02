import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

const getStatusFromQuantity = (quantity, lowStockLimit) => {
  if (quantity <= 0) return "Out Of Stock";
  if (quantity <= lowStockLimit) return "Low Stock";
  return "In Stock";
};

export const createSale = async (req, res) => {
  try {
    const {
      productId,
      quantitySold,
      unitPrice,
      soldBy,
      customerName = "",
      notes = "",
      saleDate,
    } = req.body;

    if (!productId || quantitySold === undefined || unitPrice === undefined || !soldBy) {
      return res.status(400).json({
        message: "Product, quantity sold, unit price, and seller are required",
      });
    }

    if (Number(quantitySold) <= 0) {
      return res.status(400).json({
        message: "Quantity sold must be greater than 0",
      });
    }

    if (Number(unitPrice) < 0) {
      return res.status(400).json({
        message: "Unit price cannot be negative",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      user: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const parsedQuantity = Number(quantitySold);
    const parsedUnitPrice = Number(unitPrice);
    const availableQuantity = Number(product.quantity);

    if (parsedQuantity > availableQuantity) {
      return res.status(409).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    const updatedQuantity = availableQuantity - parsedQuantity;
    const status = getStatusFromQuantity(updatedQuantity, product.lowStockLimit || 10);

    const sale = await Sale.create({
      user: req.user.id,
      productId: product._id,
      productName: product.productName,
      sku: product.sku,
      quantitySold: parsedQuantity,
      unitPrice: parsedUnitPrice,
      totalAmount: parsedQuantity * parsedUnitPrice,
      soldBy,
      customerName,
      notes,
      saleDate: saleDate || Date.now(),
    });

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product._id, user: req.user.id },
      {
        quantity: updatedQuantity,
        status,
      },
      { new: true }
    );

    res.status(201).json({
      message: "Sale created successfully",
      sale,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "saleDate";
    const order = req.query.order === "asc" ? 1 : -1;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = { user: req.user.id };

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { soldBy: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const totalSales = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalSales / limit),
      totalSales,
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const product = await Product.findOne({
      _id: sale.productId,
      user: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Associated product not found" });
    }

    const restoredQuantity = Number(product.quantity) + Number(sale.quantitySold);
    const status = getStatusFromQuantity(restoredQuantity, product.lowStockLimit || 10);

    await Product.findOneAndUpdate(
      { _id: product._id, user: req.user.id },
      { quantity: restoredQuantity, status },
      { new: true }
    );

    await Sale.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.status(200).json({
      message: "Sale deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
