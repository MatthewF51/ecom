const express = require('express');
const app = express();
const port = 3000;

// Serve your static files (index.html, styles.css)
app.use(express.static('public'));

// Custom route to prove Node.js is alive
app.get('/hello', (req, res) => {
  res.send('Node.js is working!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
