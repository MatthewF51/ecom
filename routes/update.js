const express = require('express');
const router = express.Router();
const pool = require('../db');

console.log("Router file loaded!");

router.get('/', async (req, res) => {
  console.log("GET /update hit!");

  const userId = req.query.user;
  const carId = parseInt(req.query.id);
  const carType = req.query.type;
  const attributes = req.query.attributes ? req.query.attributes.split(",") : [];

  console.log("Params received:", { userId, carId, carType, attributes });

  if (!userId || !carId || !carType) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // 1. Check if user preferences already exist
    const userQuery = `
      SELECT * FROM user_preferences WHERE user_id = $1
    `;
    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      // 2. User doesn't exist, insert new preference row
      console.log("Inserting new user preferences...");

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
          ARRAY[$2],
          $3,
          ARRAY[1],
          ARRAY[$4],
          ARRAY[1]
        )
      `, [
        userId,
        carId,
        attributes, // Pass as array from JS
        carType
      ]);

      console.log("New user preference inserted.");
    } else {
      // 3. User exists, update preferences
      const userPrefs = result.rows[0];
      console.log("User preferences found:", userPrefs);

      // Update viewed_cars if carId not in array
      if (!userPrefs.viewed_cars.includes(carId)) {
        await pool.query(`
          UPDATE user_preferences
          SET viewed_cars = array_append(viewed_cars, $1)
          WHERE user_id = $2
        `, [carId, userId]);

        console.log(`Added carId ${carId} to viewed_cars.`);
      }

      // Update preferred_car_types and car_type_ratings
      const carTypeIndex = userPrefs.preferred_car_types.indexOf(carType);

      if (carTypeIndex >= 0) {
        // Increment rating at that index
        const newCarTypeRatings = [...userPrefs.car_type_ratings];
        newCarTypeRatings[carTypeIndex] += 1;

        await pool.query(`
          UPDATE user_preferences
          SET car_type_ratings[$1] = $2
          WHERE user_id = $3
        `, [carTypeIndex + 1, newCarTypeRatings[carTypeIndex], userId]);

        console.log(`Incremented rating for carType ${carType} to ${newCarTypeRatings[carTypeIndex]}.`);
      } else {
        // Append new car type and rating
        await pool.query(`
          UPDATE user_preferences
          SET
            preferred_car_types = array_append(preferred_car_types, $1),
            car_type_ratings = array_append(car_type_ratings, 1)
          WHERE user_id = $2
        `, [carType, userId]);

        console.log(`Added new carType ${carType} with rating 1.`);
      }

      // Update viewed_attributes and attribute_ratings
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

    // Redirect to carDetails page after updating preferences
    res.redirect(`/carDetails.html?user=${userId}&id=${carId}`);
  } catch (err) {
    console.error('Error processing user preference update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
