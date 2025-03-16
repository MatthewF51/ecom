// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Include the cars API route
const carsRouter = require('./routes/cars');

// Serve static files from the public folder
app.use(express.static('public'));

// Custom route to prove Node.js is alive
app.get('/hello', (req, res) => {
  res.send('Node.js is working!');
});

// API endpoint for car data
app.use('/api/cars', carsRouter);

// Fallback route for unmatched requests (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
