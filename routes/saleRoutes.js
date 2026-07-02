import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
} from "../controllers/saleController.js";

const router = express.Router();

router.post("/", protect, createSale);
router.get("/", protect, getSales);
router.get("/:id", protect, getSaleById);
router.delete("/:id", protect, deleteSale);

export default router;
