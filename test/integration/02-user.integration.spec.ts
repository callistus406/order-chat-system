import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { app, prisma } from '../setup';

describe('UserController (Integration Tests)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = moduleFixture.createNestApplication();
    await app.init();
  
  
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'admin', password: 'admin@1234' });
  
    adminAccessToken = adminLoginResponse.body?.data?.access_token;
  
    const signupResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-up')
      .send({
        username: 'user',
        email: 'user@example.com',
        password: 'user@1234', 
      });
  
    expect(signupResponse.status).toBe(HttpStatus.CREATED);
  
    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'user', password: 'user@1234' }); 
  
    userAccessToken = userLoginResponse.body?.data?.access_token;
  
    expect(userLoginResponse.status).toBe(HttpStatus.OK);
    expect(userAccessToken).toBeDefined();
  });
  

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: 'qwerty' },
          { email: 'admin1@admin.com' },
          { username: 'unauthorized_admin' },
          { email: 'unauthorized@example.com' },
        ],
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: 'qwerty' },
          { username: 'user' },
          { email: 'admin1@admin.com' },
          { username: 'unauthorized_admin' },
          { email: 'unauthorized@example.com' },
        ],
      },
    });
    await app.close();
  });

  describe('POST /api/v1/user/create-admin', () => {
    it('should create an admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/create-admin')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'qwerty',
          email: 'admin1@admin.com',
          password: 'Admin@1234',
        });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.message).toBe('Admin user created');
    });

    it('should return 403 for unauthorized roles', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/create-admin')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          username: 'unauthorized_admin',
          email: 'unauthorized@example.com',
          password: 'Admin@1234',
        });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe("Sorry you're not authorized to access this resource");
    });
  });

  describe('GET /api/v1/user/profile', () => {
    it('should fetch the user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

    });

    it('should return 401 without valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/user/profile');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /api/v1/user/accounts', () => {
    it('should fetch all accounts for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/user/accounts')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 if user is not ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/user/accounts')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe("Sorry you're not authorized to access this resource");
    });
  });
});
