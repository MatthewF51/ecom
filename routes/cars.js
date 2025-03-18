// routes/cars.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch all cars
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch a single car by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Car not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch cars by query
router.get('/query', async (req, res) => {
  try {
	const { carType, attributes, price } = req.query;

	const attributeArray = attributes.split(',');
	
    const query = `
      SELECT * FROM cars
      WHERE carType = $1
        AND attributes && $2
        AND price <= $3
    `;

    const params = [carType, attributeArray, price];

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Cars not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
