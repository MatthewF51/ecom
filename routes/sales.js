// routes/sales.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/checkout', async (req, res) => {
  // Ensure the user is logged in.
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  
  const { carId, address } = req.body;
  const userId = req.session.user.id;
  
  if (!carId || !address) {
    return res.status(400).send('Car ID and shipping address are required.');
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO sales (user_id, car_id, address) VALUES ($1, $2, $3) RETURNING *',
      [userId, carId, address]
    );
    // Redirect to a confirmation page or send a success message.
    res.redirect('/sales_confirmation.html');
  } catch (err) {
    console.error('Error processing sale:', err);
    res.status(500).send('Error processing sale.');
  }
});

module.exports = router;
