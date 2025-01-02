import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ChatRepository } from '../common/repository/chat.respository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  public async sendMessage(
    chatRoomId: number,
    userId: number,
    content: string,
  ) {
    const chatRoom = await this.chatRepository.findChatRoom(chatRoomId);
    if (!chatRoom) throw new NotFoundException('Chat room not found');

    if (chatRoom.isClosed)
      throw new ForbiddenException('Chat room is closed by the admin.');

    const response = this.chatRepository.createMessage(
      chatRoomId,
      userId,
      content,
    );

    return response;
  }

  public async closeChat(chatRoomId: number, summary: string) {
    if (!chatRoomId || (chatRoomId && isNaN(chatRoomId)))
      throw new UnprocessableEntityException('Invalid chatRoomId.');

    const response = await this.chatRepository.closeChat(
      parseInt(chatRoomId.toString()),
      summary,
    );

    return response;
  }

  public async getChatHistory(chatRoomId: number) {
    if (!chatRoomId || (chatRoomId && isNaN(chatRoomId)))
      throw new UnprocessableEntityException('Invalid chatRoomId.');
    const chats = await this.chatRepository.findChatHistory(
      parseInt(chatRoomId.toString()),
    );

    if (!chats) throw new NotFoundException('Chat room not found');

    return {
      summary: chats.summary,
      isClosed: chats.isClosed,
      messages: chats.messages,
    };
  }
  public async getChatByRoomId(chatRoomId: number) {
    if (!chatRoomId || (chatRoomId && isNaN(chatRoomId)))
      throw new UnprocessableEntityException('Invalid chatRoomId.');
    const chats = await this.chatRepository.getChatRoomById(
      parseInt(chatRoomId.toString()),
    );

    if (!chats) throw new NotFoundException('Chat room not found');

    return chats;
  }
}
