const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { authenticateJWT, authorizeRoles, JWT_SECRET } = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Test route protected by auth
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Test route with role authorization
app.get(
  '/admin-only',
  authenticateJWT,
  authorizeRoles('Super Admin'),
  (req, res) => res.json({ success: true, message: 'Admin access granted' })
);

app.get(
  '/multi-role',
  authenticateJWT,
  authorizeRoles('Super Admin', 'Factory Manager'),
  (req, res) => res.json({ success: true })
);

// Helper to create a signed token
function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Auth Middleware', () => {

  // ─── authenticateJWT ─────────────────────────────────────────────────────────

  describe('authenticateJWT', () => {

    it('should return 401 for requests without a token (API path)', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token');
    });

    it('should accept a valid Bearer token from Authorization header', async () => {
      const token = makeToken({ id: 1, username: 'superadmin', role: 'Super Admin' });
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('Super Admin');
    });

    it('should accept a valid token from cookie', async () => {
      const token = makeToken({ id: 2, username: 'manager', role: 'Factory Manager' });
      const res = await request(app)
        .get('/protected')
        .set('Cookie', `token=${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe('manager');
    });

    it('should return 403 for expired/invalid token', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer bad.token.here')
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Invalid or expired');
    });
  });

  // ─── authorizeRoles ──────────────────────────────────────────────────────────

  describe('authorizeRoles', () => {
    it('should allow access for an authorized role', async () => {
      const token = makeToken({ id: 1, username: 'superadmin', role: 'Super Admin' });
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny access for an unauthorized role', async () => {
      const token = makeToken({ id: 5, username: 'customer', role: 'Customer' });
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should allow first role in multi-role list', async () => {
      const token = makeToken({ id: 1, username: 'admin', role: 'Super Admin' });
      const res = await request(app)
        .get('/multi-role')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
    });

    it('should allow second role in multi-role list', async () => {
      const token = makeToken({ id: 2, username: 'manager', role: 'Factory Manager' });
      const res = await request(app)
        .get('/multi-role')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
    });

    it('should deny unlisted role in multi-role list', async () => {
      const token = makeToken({ id: 3, username: 'operator', role: 'Machine Operator' });
      const res = await request(app)
        .get('/multi-role')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(403);
    });
  });
});
