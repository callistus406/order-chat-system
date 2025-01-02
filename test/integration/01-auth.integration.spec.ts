import { app, prisma } from '../setup';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

describe('AuthController (Integration)', () => {
  beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });

  describe('POST /api/v1/auth/sign-up', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchObject({
        statusCode: HttpStatus.CREATED,
      });

      const user = await prisma.user.findUnique({
        where: { email: 'testuser@example.com' },
      });
      expect(user).not.toBeNull();
    });

    it('should return 400 if input validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .set('Content-Type', 'application/json')
        .send({
          username: '',
          email: 'invalid-email',
          password: '',
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/v1/auth/sign-in', () => {
    it('should authenticate a user and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'testuser',
          password: 'Password@123',
        });
      console.log(response.body)
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        statusCode: HttpStatus.OK,
        message: 'login successful',
        data: expect.objectContaining({
          access_token: expect.any(String),
        }),
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'invaliduser',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
