// controllers/productController.js
import { db } from "../config/db.js";

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add new product
export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, category, image } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    await db.query(
      "INSERT INTO products (name, price, stock, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, stock || 0, category || "Uncategorized", image || null]
    );

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    await db.query(
      "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?",
      [name, price, stock || 0, category || "Uncategorized", image || null, id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
