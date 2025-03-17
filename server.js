// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware (use an environment variable for secret in production)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// Serve static files
app.use(express.static('public'));

// Mount authentication routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Existing cars routes
const carsRouter = require('./routes/cars');
app.use('/api/cars', carsRouter);

// Endpoint to fetch current user info (for autofilling contact page)
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    // Don't return the password
    const { id, name, email } = req.session.user;
    res.json({ id, name, email });
  } else {
    res.json({});
  }
});

// Protected sales route
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Sales page route – accessible only if logged in
app.get('/sales.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sales.html'));
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
