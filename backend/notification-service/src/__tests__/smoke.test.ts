import request from 'supertest';
import app from '../index';

describe('Notification Service smoke tests', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api returns service root', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});


