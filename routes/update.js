const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.post('/insert', async (req, res) => {
  const { user, carId, type, attributes } = req.body;

	res.redirect(`/?user=${user}&id=${carId}`);
});

module.exports = router;