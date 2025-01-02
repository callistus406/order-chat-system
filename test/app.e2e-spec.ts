import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // ✅ Enable ValidationPipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strips unvalidated properties
        forbidNonWhitelisted: true, // Rejects unknown properties
        transform: true, // Automatically transforms input to DTO instances
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    // 🧹 Reset the database
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });

  afterAll(async () => {
    await app.close();
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

      // Verify the user exists in the database
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
          username: '', // Invalid username
          email: 'invalid-email', // Invalid email
          password: '', // Invalid password
        });

      console.log(response.body); // Debugging the response if needed

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('username must be a string');
      expect(response.body.message).toContain('email must be an email');
      expect(response.body.message).toContain('password should not be empty');
    });
  });

  describe('POST /api/v1/auth/sign-in', () => {
    it('should authenticate a user and return a token', async () => {
      // Create a user for testing sign-in
      await prisma.user.create({
        data: {
          username: 'testuser_login',
          email: 'loginuser@example.com',
          password: 'Password@123', // Ensure this password is hashed in real use
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'testuser_login',
          password: 'Password@123',
        });

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
