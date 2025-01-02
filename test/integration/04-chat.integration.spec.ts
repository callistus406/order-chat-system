import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { app, prisma } from '../setup';
import * as bcrypt from 'bcrypt';

describe('ChatController (Integration Tests)', () => {
  let adminAccessToken: string;
  let userAccessToken: string;
  let chatRoomId: number;

  beforeAll(async () => {
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedAdminPassword = await bcrypt.hash('Admin@1234', 10);
    const hashedUserPassword = await bcrypt.hash('User@1234', 10);

    await prisma.user.createMany({
      data: [
        {
          username: 'admin_user',
          email: 'admin@example.com',
          password: hashedAdminPassword,
          role: 'ADMIN',
        },
        {
          username: 'normal_user',
          email: 'user@example.com',
          password: hashedUserPassword,
          role: 'USER',
        },
      ],
    });

    const admin = await prisma.user.findUnique({
      where: { username: 'admin_user' },
    });
    const user = await prisma.user.findUnique({
      where: { username: 'normal_user' },
    });

    const order = await prisma.order.create({
      data: {
        description: 'Test Order',
        specification: 'Test Specification',
        quantity: 1,
        userId: user?.id || 1,
      },
    });

    // 🛠️ Seed Chat Room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        orderId: order.id,
        isClosed: false,
      },
    });
    console.log('trtrtr', chatRoom);

    chatRoomId = parseInt(chatRoom.id.toString());

    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'admin_user', password: 'Admin@1234' });
    adminAccessToken = adminResponse.body?.data?.access_token;

    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ username: 'normal_user', password: 'User@1234' });
    userAccessToken = userResponse.body?.data?.access_token;

    expect(adminAccessToken).toBeDefined();
    expect(userAccessToken).toBeDefined();
  });

  beforeEach(async () => {
    await prisma.message.deleteMany({});
  });

  afterAll(async () => {
    try {
      await prisma.message.deleteMany({});
      await prisma.chatRoom.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.user.deleteMany({});
    } catch (error) {
      console.error('❌ Cleanup Error:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('GET /api/v1/chat/:chatRoomId/history', () => {
    console.log(chatRoomId, typeof chatRoomId);
    it('should retrieve chat history for an existing chat room', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${chatRoomId}/history`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('chats retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Object);
    });

    it('should return 401 if an unauthorized user tries to access', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/v1/chat/${chatRoomId}/history`,
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 400 for invalid chatRoomId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chat/invalid_id/history')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('POST /api/v1/chat/:chatRoomId/close', () => {
    it('should close a chat room by ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${chatRoomId}/close`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          summary: 'This chat room is closed for maintenance.',
        });
      console.log(response.body);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Chat room closed');
    });

    it('should return 403 if USER tries to close a chat room', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${chatRoomId}/close`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          summary: 'Unauthorized attempt to close chat room',
        });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe(
        "Sorry you're not authorized to access this resource",
      );
    });

    it('should return 400 for invalid chatRoomId', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/chat/invalid_id/close')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          summary: 'Invalid room',
        });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });
});
