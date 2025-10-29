import express from "express";
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  upload 
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", verifyToken, getProducts);
router.post("/", verifyToken, upload.single('image'), addProduct);
router.put("/:id", verifyToken, upload.single('image'), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;