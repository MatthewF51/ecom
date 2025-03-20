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

router.get('/recommend', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);

    console.log("➡️ Received /recommend request for userId:", userId);

    if (isNaN(userId)) {
      console.error("❌ userId is missing or invalid:", req.query.userId);
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    // 1. Fetch ALL user preferences
    const userPrefsResult = await pool.query(`
      SELECT * FROM user_preferences
    `);

    console.log(`✅ Loaded ${userPrefsResult.rows.length} user preference records`);

    // 2. Find the current user's preferences in JS
    const prefs = userPrefsResult.rows.find(user => user.user_id === userId);

    if (!prefs) {
      console.warn("❗ No user preferences found for userId:", userId);
      return res.status(404).json({ error: 'User preferences not found' });
    }

    console.log("✅ Found preferences for user:", prefs);

    // Extract preferences with defaults
    const preferredCarTypes = prefs.preferred_car_types || [];
    const carTypeRatings = prefs.car_type_ratings || [];
    const viewedAttributes = prefs.viewed_attributes || [];
    const attributeRatings = prefs.attribute_ratings || [];

    console.log("➡️ Preferences loaded:", {
      preferredCarTypes,
      carTypeRatings,
      viewedAttributes,
      attributeRatings
    });

    // Validate lengths
    if (preferredCarTypes.length !== carTypeRatings.length) {
      console.error("❌ Car type arrays mismatched lengths!", {
        preferredCarTypesLength: preferredCarTypes.length,
        carTypeRatingsLength: carTypeRatings.length
      });
      return res.status(500).json({ error: 'Internal server error: Car type preferences invalid' });
    }

    if (viewedAttributes.length !== attributeRatings.length) {
      console.error("❌ Attribute arrays mismatched lengths!", {
        viewedAttributesLength: viewedAttributes.length,
        attributeRatingsLength: attributeRatings.length
      });
      return res.status(500).json({ error: 'Internal server error: Attribute preferences invalid' });
    }

    // 3. Fetch all cars
    const carsResult = await pool.query(`SELECT * FROM cars`);
    const cars = carsResult.rows;

    console.log(`✅ Fetched ${cars.length} cars from database`);

    // 4. Rank cars
    const scoredCars = cars.map(car => {
      let score = 0;

      const carType = car.cartype;
      const carAttributes = car.attributes || [];

      console.log("🔍 Scoring car:", {
        carId: car.id,
        carType,
        carAttributes
      });

      // Match car type
      const typeIndex = preferredCarTypes.indexOf(carType);
      if (typeIndex >= 0) {
        const typeScore = carTypeRatings[typeIndex];
        console.log(`✅ Car type match found! Type: ${carType} Score: ${typeScore}`);
        score += typeScore;
      }

      // Match attributes
      carAttributes.forEach(attr => {
        const attrIndex = viewedAttributes.indexOf(attr);
        if (attrIndex >= 0) {
          const attrScore = attributeRatings[attrIndex];
          console.log(`✅ Attribute match found! Attribute: ${attr} Score: ${attrScore}`);
          score += attrScore;
        }
      });

      return {
        ...car,
        preferenceScore: score
      };
    });

    // 5. Sort by preference score (descending)
    scoredCars.sort((a, b) => b.preferenceScore - a.preferenceScore);

    console.log("✅ Sorted cars by preference score");
    console.log("🔝 Top 5 cars:", scoredCars.slice(0, 5));

    res.json(scoredCars);
  } catch (err) {
    console.error("🔥 Error executing recommendation filtering:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
