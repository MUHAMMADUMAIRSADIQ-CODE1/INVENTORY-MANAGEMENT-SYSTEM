import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: [1, "Quantity sold must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price must be greater than or equal to 0"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be greater than or equal to 0"],
    },
    soldBy: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ productName: "text", sku: "text", customerName: "text", notes: "text" });

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
