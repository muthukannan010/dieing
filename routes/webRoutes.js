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
      if (user.role === 'Customer') return res.redirect('/dashboard/customer');
      if (user.role === 'Machine Operator') return res.redirect('/dashboard/operator');
      if (user.role === 'Inventory Manager') return res.redirect('/dashboard/inventory');
      if (user.role === 'Production Supervisor') return res.redirect('/dashboard/production');
      if (user.role === 'Factory Manager') return res.redirect('/dashboard/factory');
      if (user.role === 'Super Admin') return res.redirect('/dashboard/admin');
      
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

// Dashboard Main Redirect
router.get('/dashboard', authenticateJWT, (req, res) => {
  if (req.user.role === 'Customer') return res.redirect('/dashboard/customer');
  if (req.user.role === 'Machine Operator') return res.redirect('/dashboard/operator');
  if (req.user.role === 'Inventory Manager') return res.redirect('/dashboard/inventory');
  if (req.user.role === 'Production Supervisor') return res.redirect('/dashboard/production');
  if (req.user.role === 'Factory Manager') return res.redirect('/dashboard/factory');
  if (req.user.role === 'Super Admin') return res.redirect('/dashboard/admin');
  
  res.render('dashboard', { title: 'ERP Console', page: 'dashboard' });
});

// Role Specific Dashboards
router.get('/dashboard/customer', authenticateJWT, authorizeRoles('Customer', 'Super Admin'), (req, res) => {
  res.render('dashboard-customer', { title: 'Customer Dashboard', page: 'dashboard' });
});

router.get('/dashboard/operator', authenticateJWT, authorizeRoles('Machine Operator', 'Super Admin'), (req, res) => {
  res.render('dashboard-operator', { title: 'Operator Dashboard', page: 'dashboard' });
});

router.get('/dashboard/inventory', authenticateJWT, authorizeRoles('Inventory Manager', 'Super Admin'), (req, res) => {
  res.render('dashboard-inventory', { title: 'Inventory Dashboard', page: 'dashboard' });
});

router.get('/dashboard/production', authenticateJWT, authorizeRoles('Production Supervisor', 'Super Admin'), (req, res) => {
  res.render('dashboard-production', { title: 'Production Dashboard', page: 'dashboard' });
});

router.get('/dashboard/factory', authenticateJWT, authorizeRoles('Factory Manager', 'Super Admin'), (req, res) => {
  res.render('dashboard-factory', { title: 'Factory Dashboard', page: 'dashboard' });
});

router.get('/dashboard/admin', authenticateJWT, authorizeRoles('Super Admin'), (req, res) => {
  res.render('dashboard-admin', { title: 'Administration Dashboard', page: 'dashboard' });
});

// Customer portal view (legacy redirect)
router.get('/customer-portal', authenticateJWT, authorizeRoles('Customer', 'Super Admin'), (req, res) => {
  res.redirect('/dashboard/customer');
});

// Calculators
router.get('/calc-weight', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Inventory Manager'), (req, res) => {
  res.render('calc-weight', { title: 'Fabric Weight Estimator', page: 'calc-weight' });
});

router.get('/calc-chemical', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Inventory Manager'), (req, res) => {
  res.render('calc-chemical', { title: 'Pretreatment Doser', page: 'calc-chemical' });
});

// Color matching
router.get('/colors', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), (req, res) => {
  res.render('colors', { title: 'Color Matching System', page: 'colors' });
});

// Recipe Management
router.get('/recipes', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), (req, res) => {
  res.render('recipes', { title: 'Dye Recipes Inventory', page: 'recipes' });
});

// Inventory Management
router.get('/inventory', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Inventory Manager'), (req, res) => {
  res.render('inventory', { title: 'Stock & Suppliers', page: 'inventory' });
});

// Machine monitoring
router.get('/machines', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Machine Operator'), (req, res) => {
  res.render('machines', { title: 'Machine visualizer', page: 'machines' });
});

// Factory floor map visualization
router.get('/factory-map', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Machine Operator'), (req, res) => {
  res.render('factory-map', { title: 'Factory Floor Map', page: 'factory-map' });
});

// Order Management
router.get('/orders', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Customer'), (req, res) => {
  res.render('orders', { title: 'Order Tracking', page: 'orders' });
});

// Production batches
router.get('/production', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Machine Operator'), (req, res) => {
  res.render('production', { title: 'Floor Scheduler', page: 'production' });
});

// Reports
router.get('/reports', authenticateJWT, authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor', 'Inventory Manager'), (req, res) => {
  res.render('reports', { title: 'Analytic Reports', page: 'reports' });
});

module.exports = router;
