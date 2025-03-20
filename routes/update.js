const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming this is a working pg.Pool instance

console.log("Router file loaded!");  // Should show on server startup

router.get('/', async (req, res) => {
  console.log("GET /update hit!");

  // Extract query parameters from the URL
  const user = req.query.user;
  const carId = req.query.id;
  const type = req.query.type;
  const attributes = req.query.attributes;

  console.log("Params received:", { user, carId, type, attributes });

  try {
    console.log("Checking user_preferences for existing user...");

    const result = await pool.query(`SELECT user_id FROM user_preferences;`);
/*
    let userId = "";

    // Check if the user exists already in the result set
    for (let i = 0; i < result.rows.length; i++) {
      const check = result.rows[i].user;

      // Assuming 'user' is a username or ID and not hashed
      if (user === check) {
        userId = check;
        break;
      }
    }

    // If user doesn't exist, insert them into user_preferences
    if (userId === "") {
      console.log("Inserting new user preference...");

      // Here you insert user preferences. Customize this query if needed
      await pool.query(
        `INSERT INTO user_preferences (user_id, car_id, type, attributes) VALUES ($1, $2, $3, $4);`,
        [user, carId, type, attributes]
      );

      console.log("Insertion complete!");
    } else {
      console.log("User already exists, skipping insert.");
    }
*/
    // ✅ Redirect after DB operation finishes
    console.log("Redirecting to carDetails.html...");
    res.redirect(`/carDetails.html?user=${user}&id=${carId}`);

  } catch (err) {
    console.error('Error processing update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
