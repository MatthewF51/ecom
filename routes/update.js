const express = require('express');
const router = express.Router();
const pool = require('../db');

console.log("Router file loaded!");

router.get('/', async (req, res) => {
  console.log("GET /update hit!");

  const userIdRaw = req.query.user;
  const carIdRaw = req.query.id;
  const carType = req.query.type;
  const attributesRaw = req.query.attributes;

  // Log raw params
  console.log("Raw query params:", { userIdRaw, carIdRaw, carType, attributesRaw });

  // Validate and parse types
  const userId = parseInt(userIdRaw);
  const carId = parseInt(carIdRaw);
  const attributes = attributesRaw ? attributesRaw.split(",") : [];

  // Validate after parsing
  if (isNaN(userId)) {
    console.error("Invalid userId:", userIdRaw);
    return res.status(400).json({ error: "Invalid userId parameter." });
  }
  if (isNaN(carId)) {
    console.error("Invalid carId:", carIdRaw);
    return res.status(400).json({ error: "Invalid carId parameter." });
  }
  if (!carType) {
    console.error("Missing carType");
    return res.status(400).json({ error: "Missing carType parameter." });
  }

  console.log("Params parsed successfully:", { userId, carId, carType, attributes });

  try {
    // 1. Check if user preferences already exist
    const userQuery = `
      SELECT * FROM user_preferences WHERE user_id = $1
    `;
    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      // 2. User doesn't exist, insert new preference row
      console.log("Inserting new user preferences...");
// Create ratings array matching number of attributes
const attributeRatings = attributes.map(() => 1);

// Wrap carType in an array
const preferredCarTypes = [carType];

// Always log what you're about to insert!
console.log("Inserting:", {
  userId,
  viewedCars: [carId],
  attributes,
  attributeRatings,
  preferredCarTypes,
  carTypeRatings: [1]
});

await pool.query(`
  INSERT INTO user_preferences (
    user_id,
    viewed_cars,
    viewed_attributes,
    attribute_ratings,
    preferred_car_types,
    car_type_ratings
  )
  VALUES (
    $1,
    $2::INTEGER[],
    $3::TEXT[],
    $4::INTEGER[],
    $5::TEXT[],
    $6::INTEGER[]
  )
`, [
  userId,
  [carId],               // viewed_cars as array
  attributes,            // array of attributes
  attributeRatings,      // array of 1s, same length as attributes
  preferredCarTypes,     // carType wrapped in array
  [1]                    // car_type_ratings starts with 1
]);

      console.log("New user preference inserted.");
    } else {
      // 3. User exists, update preferences
      const userPrefs = result.rows[0];
      console.log("User preferences found:", userPrefs);

      // viewed_cars
      if (!userPrefs.viewed_cars.includes(carId)) {
        await pool.query(`
          UPDATE user_preferences
          SET viewed_cars = array_append(viewed_cars, $1)
          WHERE user_id = $2
        `, [carId, userId]);
        console.log(`Added carId ${carId} to viewed_cars.`);
      }

      // preferred_car_types
      const carTypeIndex = userPrefs.preferred_car_types.indexOf(carType);
      if (carTypeIndex >= 0) {
        const newCarTypeRatings = [...userPrefs.car_type_ratings];
        newCarTypeRatings[carTypeIndex] += 1;

        await pool.query(`
          UPDATE user_preferences
          SET car_type_ratings[$1] = $2
          WHERE user_id = $3
        `, [carTypeIndex + 1, newCarTypeRatings[carTypeIndex], userId]);
        console.log(`Incremented rating for carType ${carType} to ${newCarTypeRatings[carTypeIndex]}.`);
      } else {
        await pool.query(`
          UPDATE user_preferences
          SET
            preferred_car_types = array_append(preferred_car_types, $1),
            car_type_ratings = array_append(car_type_ratings, 1)
          WHERE user_id = $2
        `, [carType, userId]);
        console.log(`Added new carType ${carType} with rating 1.`);
      }

      // viewed_attributes and attribute_ratings
      for (let attribute of attributes) {
        const attrIndex = userPrefs.viewed_attributes.indexOf(attribute);
        if (attrIndex >= 0) {
          const newAttrRatings = [...userPrefs.attribute_ratings];
          newAttrRatings[attrIndex] += 1;

          await pool.query(`
            UPDATE user_preferences
            SET attribute_ratings[$1] = $2
            WHERE user_id = $3
          `, [attrIndex + 1, newAttrRatings[attrIndex], userId]);
          console.log(`Incremented rating for attribute ${attribute} to ${newAttrRatings[attrIndex]}.`);
        } else {
          await pool.query(`
            UPDATE user_preferences
            SET
              viewed_attributes = array_append(viewed_attributes, $1),
              attribute_ratings = array_append(attribute_ratings, 1)
            WHERE user_id = $2
          `, [attribute, userId]);
          console.log(`Added new attribute ${attribute} with rating 1.`);
        }
      }
    }

    res.redirect(`/carDetails.html?user=${userId}&id=${carId}`);
  } catch (err) {
    console.error('Error processing user preference update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
