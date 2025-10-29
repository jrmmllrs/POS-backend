import { db } from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ES module equivalent of __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created at:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    
    // Add full image URL to each product and check if file exists
    const productsWithImageUrl = await Promise.all(
      rows.map(async (product) => {
        let image_url = null;
        
        if (product.image) {
          const imagePath = path.join(uploadsDir, product.image);
          
          // Check if file actually exists
          try {
            await fs.promises.access(imagePath);
            image_url = `${req.protocol}://${req.get('host')}/uploads/${product.image}`;
          } catch (error) {
            console.warn(`Image file not found: ${product.image}`);
            image_url = null;
          }
        }
        
        return {
          ...product,
          image_url
        };
      })
    );
    
    res.json(productsWithImageUrl);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add new product with image upload
export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    
    if (!name || !price) {
      // If there was a file uploaded but validation failed, delete it
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Get the uploaded file name
    const image = req.file ? req.file.filename : null;

    console.log('Adding product with image:', image);
    console.log('File path:', req.file ? req.file.path : 'No file');

    await db.query(
      "INSERT INTO products (name, price, stock, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, stock || 0, category || "Uncategorized", image]
    );

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    // If there was a file uploaded but DB operation failed, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update product with optional image upload
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Check if product exists
    const [existingProduct] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    let image = existingProduct[0].image;

    // If new image uploaded
    if (req.file) {
      // Delete old image file if it exists
      if (existingProduct[0].image) {
        const oldImagePath = path.join(uploadsDir, existingProduct[0].image);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting old image:', err);
          }
        });
      }
      image = req.file.filename;
    }

    await db.query(
      "UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?",
      [name, price, stock || 0, category || "Uncategorized", image, id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete product (also delete the image file)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product info to delete the image file
    const [product] = await db.query("SELECT image FROM products WHERE id = ?", [id]);
    
    if (product.length > 0 && product[0].image) {
      const imagePath = path.join(uploadsDir, product[0].image);
      // Delete the image file
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting image file:', err);
        }
      });
    }
    
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};