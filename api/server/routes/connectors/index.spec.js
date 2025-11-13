const request = require('supertest');
const express = require('express');
const connectorsRouter = require('./index');

// Mock authentication middleware
jest.mock('~/server/middleware', () => ({
  requireJwtAuth: (req, res, next) => {
    req.user = { id: 'test-user-123' };
    next();
  },
}));

describe('Connectors Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/connectors', connectorsRouter);
  });

  describe('GET /api/connectors/list', () => {
    it('should return list of connectors', async () => {
      const response = await request(app).get('/api/connectors/list').expect(200);

      expect(response.body).toHaveProperty('connectors');
      expect(response.body.connectors).toHaveProperty('google');
      expect(response.body.connectors).toHaveProperty('googleCloud');
      expect(response.body.connectors).toHaveProperty('rube');
    });

    it('should return connector types', async () => {
      const response = await request(app).get('/api/connectors/list').expect(200);

      const { connectors } = response.body;
      expect(connectors.google.type).toBe('oauth');
      expect(connectors.googleCloud.type).toBe('service_account');
      expect(connectors.rube.type).toBe('oauth');
    });

    it('should return connection status', async () => {
      const response = await request(app).get('/api/connectors/list').expect(200);

      const { connectors } = response.body;
      expect(connectors.google).toHaveProperty('connected');
      expect(connectors.googleCloud).toHaveProperty('connected');
      expect(connectors.rube).toHaveProperty('connected');
      expect(typeof connectors.google.connected).toBe('boolean');
    });
  });
});
