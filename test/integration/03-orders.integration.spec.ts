import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { prisma, app } from '../setup';
import * as bcrypt from 'bcrypt';

describe('OrderController (Integration Tests)', () => {
  let adminAccessToken: string;
  let userAccessToken: string;
  let orderId: number;


  beforeAll(async () => {


    const hashedAdminPassword = await bcrypt.hash('Admin@1234', 10);
    const hashedUserPassword = await bcrypt.hash('User@1234', 10);

    await prisma.user.createMany({
      data: [
        {
          username: 'admin2_user',
          email: 'admin2@example.com',
          password: hashedAdminPassword,
          role: 'ADMIN',
        },
        {
          username: 'normal2_user',
          email: 'user2@example.com',
          password: hashedUserPassword,
          role: 'USER',
        },
      ],
    });

    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'admin2_user', password: 'Admin@1234' });

    console.log('Admin Login Response:', adminResponse.body);
    adminAccessToken = adminResponse.body?.data?.access_token;
    expect(adminAccessToken).toBeDefined();

    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'normal2_user', password: 'User@1234' });

    console.log('User Login Response:', userResponse.body);
    userAccessToken = userResponse.body?.data?.access_token;
    expect(userAccessToken).toBeDefined();

  });


  afterAll(async () => {
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });


  describe('POST /api/v1/order', () => {
    it('should create an order for USER', async () => {
      console.log('USER TOKEN:', userAccessToken);

      const response = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          description: 'Test Order',
          quantity: 2,
          specifications: 'Deliver by tomorrow',
        });


      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.message).toBe('Order created');
      expect(response.body.data).toHaveProperty('id');
      orderId = response.body.data.id;
    });

    it('should return 403 for ADMIN trying to create an order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          description: 'Admin Attempt',
          quantity: 1,
          specifications: 'N/A',
        });

      console.log('Admin Create Order Response:', response.body);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe("Sorry you're not authorized to access this resource");
    });
  });


  describe('GET /api/v1/orders', () => {
    it('should retrieve user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${userAccessToken}`);

      console.log('User Orders Response:', response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Orders retrieved Successfully');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 403 for ADMIN trying to fetch user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /api/v1/admin/orders', () => {
    it('should retrieve all orders for ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      console.log('Admin Orders Response:', response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Order details retrieved');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 403 for USER accessing admin orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });


  describe('PATCH /api/v1/order/:orderId/status', () => {
    it('should update order status by ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'COMPLETED' });

      console.log('Update Order Response:', response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Order Status successfully updated');
    });

    it('should return 403 for USER updating status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
