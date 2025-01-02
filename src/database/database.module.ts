import { Module } from '@nestjs/common';
import { AdminSeeder } from './admin.seeder';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../common/repository/user.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, AdminSeeder,UserRepository],
  exports: [UserRepository, AdminSeeder],
})
export class DatabaseModule {}
