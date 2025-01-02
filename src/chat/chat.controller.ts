import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloseChatDto, CloseChatDtoHttp } from './dto/close-chat.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import { ResponseDto } from '../common/dto/response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('/api/v1/chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatRoomId/history')
  public async getChatHistory(@Param('chatRoomId') chatRoomId: number) {
    const response = await this.chatService.getChatHistory(chatRoomId);

    return new ResponseDto(
      HttpStatus.OK,
      'chats retrieved successfully',
      response,
    );
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post(':chatRoomId/close')
  @HttpCode(HttpStatus.OK)
  public async closeChat(
    @Param('chatRoomId') chatRoomId: number,
    @Body() closeChatDto: CloseChatDtoHttp,
  ) {
    const response = await this.chatService.closeChat(
      chatRoomId,
      closeChatDto.summary,
    );

    return new ResponseDto(HttpStatus.OK, 'Chat room closed', response);
  }
}
