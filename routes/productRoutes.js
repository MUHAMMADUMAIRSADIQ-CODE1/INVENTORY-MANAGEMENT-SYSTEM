import express from "express";
import {
    addProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterByCategory,
    getPaginatedProducts,
    sortProducts,
    getLowStockProducts,
    getRecentProducts,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", protect, getProducts);
router.post("/", protect, addProduct);
router.get("/search", protect, searchProducts);
router.get("/filter", protect, filterByCategory);
router.get("/pagination", protect, getPaginatedProducts);
router.get("/sort", protect, sortProducts);
router.get("/low-stock", protect, getLowStockProducts);
router.get("/recent", protect, getRecentProducts);
router.get("/:id", protect, getProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);



export default router;