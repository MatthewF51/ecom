const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.get('/:user/:carId/:type/:attributes', async (req, res) => {
  try {
	   
	  const { user,carId,type,attributes } = req.params;
    const result = await pool.query(`SELECT email FROM user_preferences`);
	
			if (result.rows.length === 0) {
				console.error('Error updating');
			  res.status(404).json({ error: 'Car not found' });
			} else {
			  res.json(upResult.rows[0]);
			}
		}
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  
  }
});

module.exports = router;