require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files from the "public" folder
app.use(express.static('public'));

// Mount routers
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const carsRouter = require('./routes/cars');
app.use('/api/cars', carsRouter);

const salesRouter = require('./routes/sales');
app.use('/api/sales', salesRouter);

const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

// ✅ Mount the updated preferences tracking router
const updateRouter = require('./routes/update');
app.use('/update', updateRouter);

// Endpoint to fetch current user info (for autofilling contact page)
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    const { id, name, email } = req.session.user;
    res.json({ id, name, email });
  } else {
    res.json({});
  }
});

// Protected sales page (requires auth)
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.get('/sales.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sales.html'));
});

// ✅ Serve carDetails.html (anyone can view after tracking)
app.get('/carDetails.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'carDetails.html'));
});

// Fallback route: serves index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
