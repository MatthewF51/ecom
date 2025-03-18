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

// Route: Fetch cars by query (Filtered in JS)
router.get('/query', async (req, res) => {
  try {
    let { carType, attributes, price } = req.query;

    // Fetch all cars first
    const result = await pool.query(`SELECT * FROM cars`);
    let cars = result.rows;

    console.log("Fetched all cars:", cars.length);

    // Convert attributes into an array (or empty if not provided)
    const attributeArray = attributes ? attributes.split(',') : [];

    // Filter in JavaScript instead of SQL
    let filteredCars = cars.filter(car => {
      // Check price condition
      if (price && car.price > Number(price)) return false;

      // Check carType condition (ignore if `*`)
      if (carType !== '*' && carType && car.cartype !== carType) return false;

      // Check attributes (only if attributes are provided)
      if (attributeArray.length > 0) {
        const carAttributes = car.attributes || [];
        if (!attributeArray.every(attr => carAttributes.includes(attr))) return false;
      }

      return true;
    });

    console.log("Filtered cars:", filteredCars.length);

    if (filteredCars.length === 0) {
      return res.status(404).json({ error: 'No cars found matching your criteria' });
    }

    res.json(filteredCars);
    
  } catch (err) {
    console.error('Error executing recommendation filtering:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
