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
router.get('/query/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const result = await pool.query('$1',[query]);
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
