import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessage } from './dto/chat.dto';
import { CloseChatDto } from './dto/close-chat.dto';
import { ForbiddenException, UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { CustomWsExceptionFilter } from '../common/filters/ws-exception.filter';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsJwtGuard)
@UseFilters(CustomWsExceptionFilter)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    console.log('🚀 Chat Gateway Initialized');
  }


  @SubscribeMessage('join_room')
  public async joinRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!payload || !payload.chatRoomId) {
        throw new ForbiddenException('chatRoomId is required');
      }
  
      const chatRoomId = payload.chatRoomId;
  
      const chatRoom = await this.chatService.getChatByRoomId(chatRoomId);
      if (!chatRoom) {
        throw new ForbiddenException('Chat room not found');
      }
  
      // if (chatRoom.isClosed) {
      //   throw new ForbiddenException('This chat room is closed and cannot be joined.');
      // }
  
      client.join(`chatRoom_${chatRoomId}`);
      console.log(`🟡 Client ${client.id} joined room: chatRoom_${chatRoomId}`);
  
      this.server.to(`chatRoom_${chatRoomId}`).emit('user_joined', {
        message: `User ${client.id} joined room ${chatRoomId}`,
      });
    } catch (error) {
      console.error(' Error in joinRoom:', error.message);
      client.emit('error', {
        status: error.status || 500,
        message: error.message || 'Failed to join room',
      });
    }
  }



  @SubscribeMessage('send_message')
  public async sendMessage(
    @MessageBody() payload: SendMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data?.user?.userId;
      const username = client.data?.user?.username;

      if (!userId) {
        throw new ForbiddenException('User ID not found');
      }

      const message = await this.chatService.sendMessage(
        payload.chatRoomId,
        userId,
        payload.content,
      );

      this.server.to(`chatRoom_${payload.chatRoomId}`).emit('receive_message', {
        id: message.id,
        content: message.content,
        senderId: userId,
        senderUsername: username,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error(' Error in sendMessage:', error.message);
      client.emit('error', {
        status: error.status || 500,
        message: error.message || 'Failed to send message',
      });
    }
  }


  @SubscribeMessage('close_chat')
  @UseGuards(new WsRolesGuard('ADMIN'))
  public async closeChat(
    @MessageBody() payload: CloseChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userRole = client.data?.user?.role;

      if (userRole !== 'ADMIN') {
        throw new ForbiddenException('Only admins can close chat rooms');
      }

      await this.chatService.closeChat(payload.chatRoomId, payload.summary);

      this.server.to(`chatRoom_${payload.chatRoomId}`).emit('chat_closed', {
        message: 'Chat room has been closed by an admin.',
        summary: payload.summary,
      });

      console.log(`🔒 Chat Room ${payload.chatRoomId} has been closed.`);
    } catch (error) {
      console.error(' Error in closeChat:', error.message);
      client.emit('error', {
        status: error.status || 500,
        message: error.message || 'Failed to close chat room',
      });
    }
  }
}
