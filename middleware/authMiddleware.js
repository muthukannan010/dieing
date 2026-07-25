const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dyetech_pro_secret_key_2026';

function authenticateJWT(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    // For web views, redirect to login page
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded; // Make user available in all EJS templates
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
      return res.redirect('/login');
    }
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      if (req.accepts('html') && !req.path.startsWith('/api/')) {
        return res.status(403).render('error', {
          title: 'Access Forbidden',
          message: 'Access Forbidden: You do not have permission to view this page.',
          user: req.user
        });
      }
      return res.status(403).json({ success: false, message: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles,
  JWT_SECRET
};
