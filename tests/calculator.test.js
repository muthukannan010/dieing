const request = require('supertest');
const express = require('express');

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
jest.mock('../config/db', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
  },
}));

// ─── Mock notification service ────────────────────────────────────────────────
jest.mock('../services/notificationService', () => ({
  sendOrderStatusEmail: jest.fn().mockResolvedValue(true),
  sendBatchStatusNotification: jest.fn().mockResolvedValue(true),
}));

const calculatorController = require('../controllers/calculatorController');

const app = express();
app.use(express.json());
app.post('/api/calculate/fabric', calculatorController.calculateFabricWeight);
app.post('/api/calculate/chemical', calculatorController.calculateChemicalRequirement);

// ─── Calculator Tests ─────────────────────────────────────────────────────────

describe('Calculator Controller', () => {

  // ─── Fabric Weight ─────────────────────────────────────────────────────────

  describe('POST /api/calculate/fabric', () => {
    it('should calculate fabric weight correctly', async () => {
      const res = await request(app)
        .post('/api/calculate/fabric')
        .send({ gsm: 200, width: 1.8, length: 1000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weight).toBe(360); // (200 * 1.8 * 1000) / 1000
      expect(res.body.data.waterRequirement).toBe(3600); // weight * 10
      expect(res.body.data.dyeRequirement).toBe(7.2); // weight * 0.02
      expect(res.body.data.processingCost).toBe(1080); // weight * 3.00
    });

    it('should return 400 for missing/invalid inputs', async () => {
      const res = await request(app)
        .post('/api/calculate/fabric')
        .send({ gsm: 'abc', width: 1.8, length: 1000 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/calculate/fabric')
        .send({ gsm: 200, width: 1.8 }); // missing length -> NaN
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle small/minimal values', async () => {
      const res = await request(app)
        .post('/api/calculate/fabric')
        .send({ gsm: 100, width: 1, length: 10 });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.weight).toBe(1); // (100*1*10)/1000 = 1
    });
  });

  // ─── Chemical Requirements ─────────────────────────────────────────────────

  describe('POST /api/calculate/chemical', () => {
    const chemTests = [
      { type: 'Acetic Acid', ratio: 0.02, cost: 1.65 },
      { type: 'Reactive Dye', ratio: 0.03, cost: 12.80 },
      { type: 'Salt', ratio: 0.15, cost: 0.45 },
      { type: 'Soda Ash', ratio: 0.08, cost: 0.85 },
      { type: 'Wetting Agent', ratio: 0.01, cost: 2.30 },
      { type: 'Hydrogen Peroxide', ratio: 0.03, cost: 3.20 },
    ];

    chemTests.forEach(({ type, ratio, cost }) => {
      it(`should calculate ${type} requirements correctly`, async () => {
        const weight = 100;
        const res = await request(app)
          .post('/api/calculate/chemical')
          .send({ weight, chemicalType: type });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        const expectedQty = Math.round(weight * ratio * 1000) / 1000;
        const expectedCost = Math.round(expectedQty * cost * 100) / 100;
        expect(res.body.data.quantity).toBe(expectedQty);
        expect(res.body.data.cost).toBe(expectedCost);
        expect(res.body.data.chemicalType).toBe(type);
        expect(res.body.data.instructions).toBeDefined();
      });
    });

    it('should use default ratio for unknown chemical type', async () => {
      const res = await request(app)
        .post('/api/calculate/chemical')
        .send({ weight: 100, chemicalType: 'UnknownChemical' });
      expect(res.statusCode).toBe(200);
      // Default ratio is 0.01
      expect(res.body.data.quantity).toBe(1); // 100 * 0.01
    });

    it('should return 400 for invalid weight', async () => {
      const res = await request(app)
        .post('/api/calculate/chemical')
        .send({ weight: 'nan', chemicalType: 'Salt' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when chemicalType is missing', async () => {
      const res = await request(app)
        .post('/api/calculate/chemical')
        .send({ weight: 100 });
      expect(res.statusCode).toBe(400);
    });
  });
});
