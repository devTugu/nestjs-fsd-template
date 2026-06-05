import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './e2e-setup';

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health/live returns 200', () => {
    return request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
  });

  it('GET /api/v1/health/ready returns 200', () => {
    return request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
  });
});

describe('Auth and RBAC (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login returns tokens for seeded admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
      })
      .expect(200);

    const body = response.body.data ?? response.body;
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('GET /api/v1/auth/me returns profile with token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body.data ?? response.body;
    expect(body.email).toBe(
      process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
    );
    expect(Array.isArray(body.permissionCodes)).toBe(true);
    expect(body.permissionCodes.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/users returns 200 for admin', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /api/v1/users returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/users').expect(401);
  });

  it('POST /api/v1/auth/refresh rotates tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const body = response.body.data ?? response.body;
    expect(body.accessToken).toBeDefined();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('POST /api/v1/auth/logout revokes session', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(204);
  });
});
