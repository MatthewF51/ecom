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

// Route: Fetch cars based on user filters
router.get('/query', async (req, res) => {
  try {
    let { carType, attributes, price } = req.query;

    // Convert attributes into an array (or empty if not provided)
    const attributeArray = attributes ? attributes.split(',') : [];

    // Handle 'Any' case properly
    let query = `SELECT * FROM cars WHERE price <= $1`;
    let params = [price];

    // If carType is not 'Any', add it to the query
    if (carType !== '*' && carType) {
      query += ` AND cartype = $2`;
      params.push(carType);
    }

    // If attributes are selected, use array containment
    if (attributeArray.length > 0) {
      query += ` AND attributes @> $${params.length + 1}`;
      params.push(attributeArray);
    }

    console.log("Executing SQL Query:", query, "with params:", params);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No cars found matching your criteria' });
    }

    res.json(result.rows);

  } catch (err) {
    console.error('Error executing recommendation query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
