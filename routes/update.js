const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.post('/insert', async (req, res) => {
  const { user, carId, type, attributes } = req.body;
  try {

	res.redirect(`/carDetails.html?user=${user}&id=${carId}`);
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });

  }
});

module.exports = router;