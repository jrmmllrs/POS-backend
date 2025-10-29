import express from "express";
import { getProducts, addProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", verifyToken, getProducts);
router.post("/", verifyToken, addProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
