import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRoomNotFoundException, UserNotFoundException } from '../exceptions/chat.exception';

@Injectable()
export class ChatRepository {
  constructor(private readonly chatModel: PrismaService) { }

  async getChatRoomById(chatRoomId: number) {
    return await this.chatModel.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { id: true, isClosed: true },
    });
  }
  
  // public async findChatRoom(chatRoomId: number) {
  //   const room = await this.chatModel.chatRoom.findUnique({
  //     where: { id: chatRoomId },
  //   });

  //   return room;
  // }

  // public async createMessage(
  //   chatRoomId: number,
  //   senderId: number,
  //   content: string,
  // ) {
  //   const response = await this.chatModel.message.create({
  //     data: {
  //       content,
  //       sender: {
  //         connect: { id: senderId } // Connect sender by senderId
  //       },
  //       chatRoom: {
  //         connect: { id: chatRoomId } // Connect chatRoom by chatRoomId
  //       },
  //     },
  //   });
  
  //   return response;
  // }
  

  public async findChatRoom(chatRoomId: number) {
    const room = await this.chatModel.chatRoom.findUnique({
      where: { id: chatRoomId },
    });
    if (!room) throw new ChatRoomNotFoundException(chatRoomId);
    return room;
  }
  
  public async createMessage(
    chatRoomId: number,
    senderId: number,
    content: string,
  ) {
    const chatRoom = await this.findChatRoom(chatRoomId);
    const sender = await this.chatModel.user.findUnique({ where: { id: senderId } });
    if (!sender) throw new UserNotFoundException(senderId);
  
    return await this.chatModel.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        chatRoom: { connect: { id: chatRoomId } },
      },
    });
  }
  

  public async closeChat(chatRoomId: number, summary: string) {
    const chatRoom = await this.findChatRoom(chatRoomId);
    if (!chatRoom) {
      throw new Error(`Chat Room with ID ${chatRoomId} does not exist.`);
    }
  
    if (chatRoom.isClosed) {
      throw new Error(`Chat Room with ID ${chatRoomId} is already closed.`);
    }
  
    const response = await this.chatModel.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        isClosed: true,
        summary,
      },
    });
  
    return response;
  }
  
  // public async closeChat(chatRoomId: number, summary: string) {
  //   const response = await this.chatModel.chatRoom.update({
  //     where: { id: chatRoomId },
  //     data: {
  //       isClosed: true,
  //       summary,
  //     },
  //   });
  //   return response;
  // }

  // public async findChatHistory(chatRoomId: number) {
  //   const chatRoom = await this.chatModel.chatRoom.findUnique({
  //     where: { id: chatRoomId },
  //     include: {
  //       messages: {
  //         orderBy: { createdAt: 'asc' },
  //       },
  //     },
  //   });

  //   return chatRoom;
  // }
  public async findChatHistory(chatRoomId: number) {
    // Fetch the chat room to ensure it exists
    const chatRoom = await this.findChatRoom(chatRoomId);
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }
  
    const messages = await this.chatModel.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        sender: {
          select: {
            username: true,
          },
        },
      },
    });
  
    return {
      chatRoomId: chatRoom.id,
      isClosed: chatRoom.isClosed,
      summary: chatRoom.summary,
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderUsername: msg.sender?.username || 'Unknown',
        createdAt: msg.createdAt,
      })),
    };
  }
}  
