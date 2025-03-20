const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ 1. Recommend cars FIRST
router.get('/recommend', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    console.log("➡️ Received /recommend request for userId:", userId);

    if (isNaN(userId)) {
      console.error("❌ userId is missing or invalid:", req.query.userId);
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    const userPrefsResult = await pool.query(`SELECT * FROM user_preferences`);
    console.log(`✅ Loaded ${userPrefsResult.rows.length} user preference records`);

    const prefs = userPrefsResult.rows.find(user => user.user_id === userId);

    if (!prefs) {
      console.warn("❗ No user preferences found for userId:", userId);
      return res.status(404).json({ error: 'User preferences not found' });
    }

    const preferredCarTypes = prefs.preferred_car_types || [];
    const carTypeRatings = prefs.car_type_ratings || [];
    const viewedAttributes = prefs.viewed_attributes || [];
    const attributeRatings = prefs.attribute_ratings || [];

    if (preferredCarTypes.length !== carTypeRatings.length ||
        viewedAttributes.length !== attributeRatings.length) {
      console.error("❌ Preferences length mismatch");
      return res.status(500).json({ error: 'Preferences data invalid' });
    }

    const carsResult = await pool.query(`SELECT * FROM cars`);
    const cars = carsResult.rows;

    const scoredCars = cars.map(car => {
      let score = 0;
      const typeIndex = preferredCarTypes.indexOf(car.cartype);
      if (typeIndex >= 0) {
        score += carTypeRatings[typeIndex];
      }

      const carAttributes = Array.isArray(car.attributes) ? car.attributes : [];
      carAttributes.forEach(attr => {
        const attrIndex = viewedAttributes.indexOf(attr);
        if (attrIndex >= 0) {
          score += attributeRatings[attrIndex];
        }
      });

      return { ...car, preferenceScore: score };
    });

    scoredCars.sort((a, b) => b.preferenceScore - a.preferenceScore);

    res.json(scoredCars);
  } catch (err) {
    console.error("🔥 Error executing recommendation filtering:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ 2. Get all cars
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ 3. Get a single car by ID (KEEP THIS LAST)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carId = parseInt(id);

    if (isNaN(carId)) {
      console.error(`❌ Invalid car ID: ${id}`);
      return res.status(400).json({ error: 'Invalid car ID' });
    }

    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);

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
