import mongoose from "mongoose";

const getStatusFromQuantity = (quantity, lowStockLimit) => {
  if (quantity <= 0) return "Out Of Stock";
  if (quantity <= lowStockLimit) return "Low Stock";
  return "In Stock";
};

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be greater than or equal to 0"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    lowStockLimit: {
      type: Number,
      default: 10,
      min: [0, "Low stock limit cannot be negative"],
    },
    status: {
      type: String,
      default: "In Stock",
    },
    supplier: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;