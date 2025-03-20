const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`INSERT INTO user_preferences (
    user_id,
    viewed_cars,
    viewed_attributes,
    attribute_ratings,
    preferred_car_types,
    car_type_ratings
) VALUES (
    -- user_id
    ?, 
    -- viewed_cars (e.g., '["car1", "car2"]')
    ?, 
    -- viewed_attributes (e.g., '["color", "speed"]')
    ?, 
    -- attribute_ratings (e.g., '{"color": 4, "speed": 5}')
    ?, 
    -- preferred_car_types (e.g., '["SUV", "Sedan"]')
    ?, 
    -- car_type_ratings (e.g., '{"SUV": 5, "Sedan": 3}')
    ?
);`,);
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

module.exports = router;