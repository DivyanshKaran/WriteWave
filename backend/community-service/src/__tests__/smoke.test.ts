import request from 'supertest';
import app from '../index';

describe('Community Service smoke tests', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/community/forums returns 200', async () => {
    const res = await request(app).get('/api/community/forums');
    expect(res.status).toBe(200);
  });
});


