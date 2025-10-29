import express from "express";
import { getSales, createSale, getSaleById } from "../controllers/salesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getSales);
router.get("/:id", verifyToken, getSaleById);
router.post("/", verifyToken, createSale);

export default router;
