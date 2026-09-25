const request = require('supertest');
const express = require('express');
const { updateOrderStatus } = require('../controllers/orderController');

// Mock supabase db config
jest.mock('../config/db', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { order_no: 'ORD-123', customers: { name: 'Test', email: 'test@example.com' } }
    })
  }
}));

// Mock notification service
jest.mock('../services/notificationService', () => ({
  sendOrderStatusEmail: jest.fn().mockResolvedValue(true)
}));

const app = express();
app.use(express.json());
app.put('/api/orders/:id/status', updateOrderStatus);

describe('Order Controller', () => {
  it('should update order status successfully', async () => {
    // Override the mock to return success for this specific test
    const { supabase } = require('../config/db');
    supabase.eq.mockResolvedValueOnce({ error: null });

    const res = await request(app)
      .put('/api/orders/1/status')
      .send({ status: 'Completed' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Order status updated successfully.');
  });
});
