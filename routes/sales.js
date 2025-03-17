const express = require("express");
const router = express.Router();
const pool = require("../db");

// Process a car purchase
router.post("/", async (req, res) => {
  const { carId, name, email, phone, address } = req.body;

  try {
    await pool.query("BEGIN");

    // Insert sale record
    const insertSaleQuery = `
      INSERT INTO sales (car_id, buyer_name, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(insertSaleQuery, [carId, name, email, phone, address]);

    // Mark car as unavailable
    const updateCarQuery = `UPDATE cars SET available = FALSE WHERE id = $1`;
    await pool.query(updateCarQuery, [carId]);

    await pool.query("COMMIT");
    res.status(200).json({ message: "Purchase successful" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error processing sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
