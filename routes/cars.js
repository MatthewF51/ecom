// routes/cars.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Existing route: fetch all cars
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Car not found' });
    } else {
      res.json(result.rows[0]);  // This row should now include image_url, additional_images, and attributes.
    }
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Grab the form element
const form = document.getElementById('carForm');

// Add a submit event listener
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Stop the form from submitting normally

  // Get form data
  const formData = new FormData(form);

  // Extract values
  const carType = formData.get('carType');
  const price = formData.get('price');

  // Do something with the data (e.g., log it, send it to an API)
  console.log('Car Type:', carType);
  console.log('Max Price:', price);

  // Example: Send the data to your backend with fetch (POST request)
  fetch('/cars/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      carType: carType,
      price: price
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Server response:', data);
    // You can now update the UI with data if you want!
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

router.get('/:carType', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars WHERE carType = $carType', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Car not found' });
    } else {
      res.json(result.rows[0]);  // This row should now include image_url, additional_images, and attributes.
    }
  } catch (err) {
    console.error('Error fetching car details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



