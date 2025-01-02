import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class CustomWsExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const errorMessage = exception.message || 'Unknown WebSocket error';

    console.error('WebSocket Exception:', errorMessage);

    client.emit('error', { message: errorMessage });
  }
}
