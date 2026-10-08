const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Build a chainable mock object for supabase
const mockChain = {};
['from','select','insert','update','delete','eq','or','limit','order','single'].forEach(m => {
  mockChain[m] = jest.fn().mockReturnValue(mockChain);
});

jest.mock('../config/db', () => ({
  supabase: mockChain,
  initializeDatabase: jest.fn().mockResolvedValue(true),
  getMode: jest.fn().mockReturnValue('supabase'),
  getClient: jest.fn(),
}));


const authController = require('../controllers/authController');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.get('/api/auth/logout', authController.logout);

const { supabase } = require('../config/db');

describe('Auth Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore chainable return values after clearAllMocks
    ['from','select','insert','update','delete','eq','or','limit','order','single'].forEach(m => {
      supabase[m].mockReturnValue(supabase);
    });
  });


  // ─── REGISTER ────────────────────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {

    it('should return 400 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' }); // missing email & password
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please fill in all required fields.');
    });

    it('should return 400 when username already exists', async () => {
      supabase.limit.mockResolvedValueOnce({ data: [{ id: 1 }], error: null });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', email: 'test@example.com', password: 'pass123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username or email already exists.');
    });

    it('should register a new user successfully', async () => {
      // No existing user found
      supabase.limit.mockResolvedValueOnce({ data: [], error: null });
      // Insert succeeds
      supabase.insert.mockResolvedValueOnce({ error: null });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'newuser@example.com', password: 'pass123' });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Registration successful');
    });

    it('should return 500 on database error during insert', async () => {
      supabase.limit.mockResolvedValueOnce({ data: [], error: null });
      supabase.insert.mockResolvedValueOnce({ error: { message: 'DB error' } });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'newuser@example.com', password: 'pass123' });
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── LOGIN ────────────────────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('should return 400 when credentials are empty', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please enter username and password.');
    });

    it('should return 401 for unknown username', async () => {
      supabase.limit.mockResolvedValueOnce({ data: [], error: null });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ghost', password: 'wrong' });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid username or password.');
    });

    it('should return 401 for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPwd = await bcrypt.hash('correctPassword', 10);
      supabase.limit.mockResolvedValueOnce({
        data: [{ id: 1, username: 'admin', email: 'admin@texcolor.com', password: hashedPwd, role: 'Super Admin' }],
        error: null
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongPassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should login successfully and return JWT cookie', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPwd = await bcrypt.hash('superadmin123', 10);
      supabase.limit.mockResolvedValueOnce({
        data: [{ id: 1, username: 'superadmin', email: 'superadmin@texcolor.com', password: hashedPwd, role: 'Super Admin' }],
        error: null
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'superadmin', password: 'superadmin123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.role).toBe('Super Admin');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

  describe('POST /api/auth/forgot-password', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please provide email address.');
    });

    it('should return 404 when email is not registered', async () => {
      supabase.limit.mockResolvedValueOnce({ data: [], error: null });
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'notfound@example.com' });
      expect(res.statusCode).toBe(404);
    });

    it('should send a reset link for a valid email', async () => {
      supabase.limit.mockResolvedValueOnce({ data: [{ id: 1 }], error: null });
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'superadmin@texcolor.com' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── LOGOUT ──────────────────────────────────────────────────────────────────

  describe('GET /api/auth/logout', () => {
    it('should clear cookie and redirect (html)', async () => {
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Accept', 'text/html');
      expect([302, 200]).toContain(res.statusCode);
    });

    it('should return JSON success for API logout', async () => {
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Accept', 'application/json');
      expect(res.body.success).toBe(true);
    });
  });
});
