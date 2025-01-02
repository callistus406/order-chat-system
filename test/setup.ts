import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

let app: INestApplication;
let prisma: PrismaService;

beforeAll(async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      stopAtFirstError: true, 
      validationError: {
        target: false, 
        value: false, 
      },
    }),
  );

  await app.init();

  prisma = app.get(PrismaService);

  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.order.deleteMany(),
  ]);
});

// afterAll(async () => {
//   await prisma.$transaction([
//     prisma.user.deleteMany(),
//     prisma.order.deleteMany(),
//   ]);

//   await prisma.$disconnect();
//   await app.close();
// });

export { app, prisma };
  
