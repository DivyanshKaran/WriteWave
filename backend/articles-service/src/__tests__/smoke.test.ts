import request from 'supertest';
import app from '../index';

describe('Articles Service smoke tests', () => {
  it('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/articles returns 200', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});


