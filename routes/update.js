const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.get('/:user/:carId/:type/:attributes', async (req, res) => {
  try {
	  console.error('Updating');
	  const { user,carId,type,attributes } = req.params;
    const result = await pool.query(`SELECT email FROM user_preferences`);
	let user_id = "none";
	if (result.rows.length != 0) {
		for (let i = 0; i < result.rows.length; i++) {
			
			const check = result.rows[i];
			const valid = await bcrypt.compare(user, check.email);
			if (valid) {
				user_id = check.email;
				break;
			}
		}
		
		if (user_id == "none"){
			const upResult = await pool.query(`INSERT INTO user_preferences (
			user_id,
			viewed_cars,
			viewed_attributes,
			attribute_ratings,
			preferred_car_types,
			car_type_ratings
		) VALUES (
			$1,
			[$2],
			[$3],
			[$4],
			[$5],
			[$6]
			);`,[result.email,carId,attributes,[1,1,1],type,[1]);
			
			if (upResult.rows.length === 0) {
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