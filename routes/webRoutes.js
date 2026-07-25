const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      if (user.role === 'Customer') {
        return res.redirect('/customer-portal');
      }
      return res.redirect('/dashboard');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  next();
};

// Landing Page
router.get('/', (req, res) => {
  const token = req.cookies.token;
  let user = null;
  if (token) {
    try { user = jwt.verify(token, JWT_SECRET); } catch (e) {}
  }
  res.render('home', { title: 'Welcome', user });
});

// Authentication
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { title: 'Register' });
});

router.get('/forgot-password', redirectIfLoggedIn, (req, res) => {
  res.render('forgot-password', { title: 'Reset Request' });
});

// Dashboard redirecting
router.get('/dashboard', authenticateJWT, (req, res) => {
  if (req.user.role === 'Customer') {
    return res.redirect('/customer-portal');
  }
  res.render('dashboard', { title: 'ERP Console', page: 'dashboard' });
});

// Customer portal view
router.get('/customer-portal', authenticateJWT, authorizeRoles('Customer', 'Super Admin'), (req, res) => {
  res.render('customer-portal', { title: 'Customer Operations Desk', page: 'customer-portal' });
});

// Calculators
router.get('/calc-weight', authenticateJWT, (req, res) => {
  res.render('calc-weight', { title: 'Fabric Weight Estimator', page: 'calc-weight' });
});

router.get('/calc-chemical', authenticateJWT, (req, res) => {
  res.render('calc-chemical', { title: 'Pretreatment Doser', page: 'calc-chemical' });
});

// Color matching
router.get('/colors', authenticateJWT, (req, res) => {
  res.render('colors', { title: 'Color Matching System', page: 'colors' });
});

// Recipe Management
router.get('/recipes', authenticateJWT, (req, res) => {
  res.render('recipes', { title: 'Dye Recipes Inventory', page: 'recipes' });
});

// Inventory Management
router.get('/inventory', authenticateJWT, (req, res) => {
  res.render('inventory', { title: 'Stock & Suppliers', page: 'inventory' });
});

// Machine monitoring
router.get('/machines', authenticateJWT, (req, res) => {
  res.render('machines', { title: 'Machine visualizer', page: 'machines' });
});

// Factory floor map visualization
router.get('/factory-map', authenticateJWT, (req, res) => {
  res.render('factory-map', { title: 'Factory Floor Map', page: 'factory-map' });
});



// Order Management
router.get('/orders', authenticateJWT, (req, res) => {
  res.render('orders', { title: 'Order Tracking', page: 'orders' });
});

// Production batches
router.get('/production', authenticateJWT, (req, res) => {
  res.render('production', { title: 'Floor Scheduler', page: 'production' });
});

// Reports
router.get('/reports', authenticateJWT, (req, res) => {
  res.render('reports', { title: 'Analytic Reports', page: 'reports' });
});

module.exports = router;
