// routes/productRoutes.js
import express from "express";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", verifyToken, getProducts);
router.post("/", verifyToken, addProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;