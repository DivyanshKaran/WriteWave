import request from 'supertest';
import app from '../index';

describe('Content Service smoke tests', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/characters returns 200', async () => {
    const res = await request(app).get('/api/v1/characters');
    expect(res.status).toBe(200);
  });
});


