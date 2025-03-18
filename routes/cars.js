const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ensure this points to your PostgreSQL connection setup

// Route: Fetch all cars
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cars:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Fetch a single car by ID
router.get('/:id', async (req, res) => {
    try {
        const carId = parseInt(req.params.id);
        if (isNaN(carId)) {
            return res.status(400).json({ error: 'Invalid car ID' });
        }
        const result = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching car details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Fetch cars based on query parameters
router.get('/query', async (req, res) => {
    try {
        let { carType, attributes, price } = req.query;
        let queryParams = [];
        let queryConditions = [];

        if (carType && carType !== '*') {
            queryParams.push(carType);
            queryConditions.push(`cartype = $${queryParams.length}`);
        }

        if (attributes) {
            let attributeArray = attributes.split(',');
            queryParams.push(attributeArray);
            queryConditions.push(`attributes && $${queryParams.length}`);
        }

        if (price) {
            queryParams.push(parseFloat(price));
            queryConditions.push(`price <= $${queryParams.length}`);
        }

        let query = 'SELECT * FROM cars';
        if (queryConditions.length > 0) {
            query += ' WHERE ' + queryConditions.join(' AND ');
        }

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cars by query:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;