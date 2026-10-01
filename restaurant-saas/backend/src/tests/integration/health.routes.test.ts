import request from 'supertest';
import app from '../../app';

describe('Health routes', () => {
  it('returns liveness details on /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      status: 'ok',
      service: 'restaurant-automation-backend',
      version: 'v1',
      environment: 'test',
    });
    expect(typeof response.body.data.timestamp).toBe('string');
    expect(typeof response.body.data.uptimeSeconds).toBe('number');
  });

  it('returns readiness details on /ready when the database is connected', async () => {
    const response = await request(app).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      status: 'ready',
      service: 'restaurant-automation-backend',
      version: 'v1',
    });
    expect(response.body.data.checks.database).toMatchObject({
      status: 'connected',
      readyState: 1,
      required: true,
    });
  });

  it('returns version metadata on /version', async () => {
    const response = await request(app).get('/version');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      version: 'v1',
      service: 'restaurant-automation-backend',
      releaseDate: '2026-06-07',
      contract: 'restaurant_automation_api_documentation_updated.pdf',
    });
  });
});
