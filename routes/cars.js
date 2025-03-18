// routes/cars.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch all cars (Default Load)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch a single car by ID
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

// Route: Fetch cars by query (Recommendation System)
router.get('/query', async (req, res) => {
  try {
    let { carType, attributes, price } = req.query;

    let query = `SELECT * FROM cars WHERE price <= $1`;
    let params = [parseFloat(price)];

    // Handle "Any" selection for car type
    if (carType && carType !== '*' && carType !== 'Any') {
      query += ` AND cartype = $${params.length + 1}`;
      params.push(carType);
    }

    // Handle attributes correctly for PostgreSQL array
    if (attributes && attributes !== '') {
      const attributeArray = attributes.split(',');
      query += ` AND attributes @> $${params.length + 1}`;
      params.push(attributeArray);
    }

    console.log("Executing SQL Query:", query, params); // Debugging

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No matching cars found' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching recommended cars:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
