const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

console.log("Router file loaded!");  // Should show on server startup

router.get('/', async (req, res) => {
  console.log("GET /update hit!");

  const user = req.query.user;
  const carId = req.query.id;
  const type = req.query.type;
  const attributes = req.query.attributes;

  console.log("Params:", { user, carId, type, attributes });

  try {
    console.log("Before querying user_preferences");

    const result = await pool.query(`SELECT user FROM user_preferences`);

    let userId = "";

    if (result.rows.length === 0) {
      console.error('No users found');
      return res.status(404).json({ error: 'No users found' });
    }

    for (let i = 0; i < result.rows.length; i++) {
      const check = result.rows[i].user;

      if (user === check) {
        userId = check;
        break;
      }
    }

    if (userId === "") {
      console.log("Inserting new user preference...");

      await pool.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1);`,
        [user]
      );
    }

    // ✅ Redirect user to car details page
    res.redirect(`/carDetails.html?user=${user}&id=${carId}`);
  } catch (err) {
    console.error('Error processing update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
