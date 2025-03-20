const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.post('/', async (req, res) => {
  const { user, carId, type, attributes } = req.body;
  try {
	   
    const result = await pool.query(`SELECT email FROM users`);
	
	if (result.rows.length === 0) {
		console.error('Error updating');
	  res.status(404).json({ error: 'Car not found' });
	} else {
	  res.json(upResult.rows[0]);
	}
	res.redirect(`/carDetails.html?user=${user}&id=${carId}`);
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
	res.redirect(`/carDetails.html?user=${user}&id=${carId}`);
  }
});

module.exports = router;