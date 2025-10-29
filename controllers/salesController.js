import { db } from "../config/db.js";

// ✅ Get all sales
export const getSales = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
      SUM(si.quantity) AS total_items 
      FROM sales s 
      LEFT JOIN sale_items si ON s.id = si.sale_id 
      GROUP BY s.id ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Get Sales Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get one sale + its items
export const getSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    // Get sale info
    const [sales] = await db.query("SELECT * FROM sales WHERE id = ?", [id]);
    if (sales.length === 0)
      return res.status(404).json({ message: "Sale not found" });

    const sale = sales[0];

    // Get items with product names & prices
    const [items] = await db.query(
      `SELECT si.*, p.name, p.price 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [id]
    );

    res.json({
      ...sale,
      items,
    });
  } catch (error) {
    console.error("Get Sale by ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Create a new sale - FIXED VERSION
export const createSale = async (req, res) => {
  const { items, payment_method, reference_no } = req.body; // ✅ Added reference_no

  if (!items || items.length === 0)
    return res.status(400).json({ message: "No items in sale" });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Updated to include reference_no in the INSERT statement
    const [result] = await conn.query(
      "INSERT INTO sales (total, payment_method, reference_no) VALUES (?, ?, ?)",
      [total, payment_method || "Cash", reference_no || null] // ✅ Added reference_no
    );
    const saleId = result.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)",
        [saleId, item.id, item.quantity, item.price * item.quantity]
      );
      await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Sale recorded successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("Create Sale Error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};
