const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // <-- You missed this import
const pool = require('../db');

console.log("Update");

// Route: Fetch a single car by ID
router.post('/', async (req, res) => {
  console.log("Update");

  const { user, carId, type, attributes } = req.body;

  try {
    console.log("Before UP");

    const result = await pool.query(`SELECT user FROM user_preferences`);

    let userId = "";

    if (result.rows.length === 0) {
      console.error('Error: No users found');
      return res.status(404).json({ error: 'Car not found' });
    } else {
      for (let i = 0; i < result.rows.length; i++) {
        const check = result.rows[i].user;

        const valid = await bcrypt.compare(user, check);

        if (valid) {
          userId = check;
          break;
        }
      }

      if (userId === "") {
        console.log("Before insert");

        const rResult = await pool.query(
          `INSERT INTO user_preferences (user_id) VALUES ($1);`,
          [user] // Or userId depending on your logic
        );
      }
    }

    // Prefer sending JSON instead of a redirect in an API
    res.json({ success: true, redirectTo: `/carDetails.html?user=${user}&id=${carId}` });
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
