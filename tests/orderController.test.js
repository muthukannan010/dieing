const request = require('supertest');
const express = require('express');

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
// All chainable methods return the same mock object.
// Terminal calls (single, eq, order) can be overridden per-test with mockResolvedValueOnce.
const mockChain = {};
const chainMethods = ['from', 'select', 'insert', 'update', 'delete',
  'eq', 'neq', 'or', 'ilike', 'limit', 'order', 'single', 'patch'];

chainMethods.forEach(m => { mockChain[m] = jest.fn(); });
// Default: return self for chaining
chainMethods.forEach(m => { mockChain[m].mockReturnValue(mockChain); });

jest.mock('../config/db', () => ({ supabase: mockChain }));

// ─── Mock notification service ────────────────────────────────────────────────
jest.mock('../services/notificationService', () => ({
  sendOrderStatusEmail: jest.fn().mockResolvedValue(true),
}));

const orderController = require('../controllers/orderController');
const { supabase } = require('../config/db');

const app = express();
app.use(express.json());

// Inject mock user (authenticated)
app.use((req, res, next) => {
  req.user = { id: 1, role: 'Factory Manager', email: 'manager@texcolor.com' };
  next();
});

app.get('/api/orders', orderController.getAllOrders);
app.post('/api/orders', orderController.createOrder);
app.put('/api/orders/:id', orderController.updateOrder);
app.patch('/api/orders/:id/status', orderController.updateOrderStatus);
app.delete('/api/orders/:id', orderController.deleteOrder);

describe('Order Controller', () => {

  beforeEach(() => {
    // Reset all mocks to return self (chainable) before each test
    chainMethods.forEach(m => {
      supabase[m].mockReset();
      supabase[m].mockReturnValue(supabase);
    });
  });

  // ─── GET ALL ORDERS ──────────────────────────────────────────────────────────

  describe('GET /api/orders', () => {
    it('should return list of orders', async () => {
      const mockOrders = [
        { id: 1, order_no: 'ORD-001', color_name: 'Emerald Green', customers: { name: 'TextCo' }, fabric_types: { name: 'Cotton' } },
        { id: 2, order_no: 'ORD-002', color_name: 'Ruby Red', customers: { name: 'Apex' }, fabric_types: { name: 'Polyester' } },
      ];
      // The getAllOrders query chain ends with .order() → returns orders
      supabase.order
        .mockResolvedValueOnce({ data: mockOrders, error: null })  // main orders query
        .mockResolvedValueOnce({ data: [{ id: 1, name: 'TextCo' }], error: null }) // customers
        .mockResolvedValueOnce({ data: [{ id: 1, name: 'Cotton' }], error: null }); // fabricTypes

      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });

    it('should return 500 on database error', async () => {
      supabase.order.mockResolvedValueOnce({ data: null, error: { message: 'DB fail' } });
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── CREATE ORDER ────────────────────────────────────────────────────────────

  describe('POST /api/orders', () => {
    const validOrder = {
      customer_id: 1,
      fabric_type_id: 1,
      color_name: 'Emerald Green',
      quantity_kg: 500,
      gsm: 180,
      width_inches: 1.8,
      length_meters: 2000,
      dye_type: 'Reactive Dye',
      delivery_date: '2026-12-01',
    };

    it('should create an order successfully', async () => {
      // Chain: from().insert().select().single() → resolves with new order
      supabase.single
        .mockResolvedValueOnce({ data: { id: 10 }, error: null })  // order insert
        .mockResolvedValueOnce({ data: { name: 'TextCo', email: 'text@co.com' }, error: null }); // customer notification
      // activity_log insert: from().insert() is a fire-and-forget, chain ends at insert
      // Already returns supabase (chainable mock), no dedicated resolve needed

      const res = await request(app).post('/api/orders').send(validOrder);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('created successfully');
    });

    it('should return 400 when required fields are missing', async () => {
      const { color_name, ...incomplete } = validOrder; // remove color_name
      const res = await request(app).post('/api/orders').send(incomplete);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database insert error', async () => {
      // single() returns an error on insert
      supabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Constraint violation' } });
      const res = await request(app).post('/api/orders').send(validOrder);
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── UPDATE ORDER STATUS ─────────────────────────────────────────────────────

  describe('PATCH /api/orders/:id/status', () => {
    it('should update status successfully', async () => {
      supabase.eq
        .mockResolvedValueOnce({ error: null })  // update().eq()
        .mockReturnValueOnce(supabase);           // select().eq() (for notification fetch)
      supabase.single.mockResolvedValueOnce({
        data: { order_no: 'ORD-001', customers: { name: 'TextCo', email: 'text@co.com' } },
        error: null
      });

      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'Completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order status updated successfully.');
    });

    it('should return 500 on update failure', async () => {
      supabase.eq.mockResolvedValueOnce({ error: { message: 'Update failed' } });
      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'Completed' });
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── DELETE ORDER ────────────────────────────────────────────────────────────

  describe('DELETE /api/orders/:id', () => {
    it('should delete an order successfully', async () => {
      supabase.eq.mockResolvedValueOnce({ error: null });
      const res = await request(app).delete('/api/orders/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should return 500 when delete fails', async () => {
      supabase.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });
      const res = await request(app).delete('/api/orders/1');
      expect(res.statusCode).toBe(500);
    });
  });
});
