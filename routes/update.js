const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

console.log("Router file loaded!");  // This should show on server startup.

router.get('/', async (req, res) => {
  console.log("GET /api/update hit!");

  const user = req.query.user;        // This will be undefined unless you pass ?user=...
  const carId = req.query.id;         // You have id=4 in your URL
  const type = req.query.type;        // type=Saloon
  const attributes = req.query.attributes; // attributes=fast,luxurious,four-door,five-seater

  console.log("Params:", { user, carId, type, attributes });


  const { user, carId, type, attributes } = req.body;
  console.log("Request body:", req.body);

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
      const valid = await bcrypt.compare(user, check);

      if (valid) {
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

    res.json({ success: true, redirectTo: `/carDetails.html?user=${user}&id=${carId}` });
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
