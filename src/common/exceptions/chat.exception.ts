import { NotFoundException, BadRequestException } from '@nestjs/common';

export class ChatRoomNotFoundException extends NotFoundException {
  constructor(chatRoomId: number) {
    super(`Chat Room with ID ${chatRoomId} not found.`);
  }
}

export class ChatRoomAlreadyClosedException extends BadRequestException {
  constructor(chatRoomId: number) {
    super(`Chat Room with ID ${chatRoomId} is already closed.`);
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`User with ID ${userId} not found.`);
  }
}
