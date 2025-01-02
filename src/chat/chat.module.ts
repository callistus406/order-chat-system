import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from '../common/repository/chat.respository';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[AuthModule],
  providers: [PrismaService, ChatService, ChatGateway, ChatRepository,JwtService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
