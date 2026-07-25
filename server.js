const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const dbSchema = require('./models/dbSchema');
const webRoutes = require('./routes/webRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS engine and views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
// Also allow serving from original css folder for compatibility
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Connect Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'An unexpected server-side error occurred. Please contact engineering support.',
    user: req.user || null
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Setup tables and mock values
    await dbSchema.setupSchema();
    
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(` DyeTech Pro Engine Started Successfully!`);
      console.log(` Port:    http://localhost:${PORT}`);
      console.log(` DB Mode: ${db.getMode().toUpperCase()} (${process.env.SUPABASE_URL || 'N/A'})`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server engine:', error);
    process.exit(1);
  }
}

startServer();
// Schema reloaded
