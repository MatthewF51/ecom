const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Fetch a single car by ID
router.post('/', async (req, res) => {
  const { user, carId, type, attributes } = req.body;
  try {
	console.log("Before UP")   
    const result = await pool.query(`SELECT user FROM user_preferences`);
	let userId = "";
	if (result.rows.length === 0) {
		console.error('Error updating');
	  res.status(404).json({ error: 'Car not found' });
	} else {
		for (int i; i< result.rows.length; i++){
			
			check = result.rows[i];
			 const valid = await bcrypt.compare(user, check);
			 if (valid){
				 userId = check
				 break;
			 }
		}
		
		if (userId == ""){
			const rResult = await pool.query(`INSERT INTO user_preferences (
    user_id
 
) VALUES (
	$1
);`,[userId]);

		}
	}
	res.redirect(`/carDetails.html?user=${user}&id=${carId}`);
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
