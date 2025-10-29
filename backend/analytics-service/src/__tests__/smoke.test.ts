import request from 'supertest';
import app from '../index';

describe('Analytics Service smoke tests', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/ returns service info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});


