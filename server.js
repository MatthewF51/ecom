require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware (use environment variable for secret)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files from the "public" folder
app.use(express.static('public'));

// Mount authentication routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const carsRouter = require('./routes/cars');
app.use('/api/cars', carsRouter);

const salesRouter = require('./routes/sales');
app.use('/api/sales', salesRouter);

const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

// OPTION 1: Inline GET route for /update (quick test)
app.get('/update', (req, res) => {
  console.log("GET /update hit!");

  const { id: carId, type, attributes } = req.query;

  console.log({ carId, type, attributes });

  res.json({
    success: true,
    carId,
    type,
    attributes
  });
});

// OPTION 2 (Recommended): Use the router instead of inline route
// const updateRouter = require('./routes/update');
// app.use('/update', updateRouter);

// Endpoint to fetch current user info (for autofilling contact page)
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    const { id, name, email } = req.session.user;
    res.json({ id, name, email });
  } else {
    res.json({});
  }
});

// Protected sales route middleware
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

// Fallback route: serve index.html for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
