import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
      console.log("=============")
    const client: Socket = context.switchToWs().getClient();

    const token = client.handshake.headers.authorization?.split(' ')[1]
      || client.handshake.auth?.token
      || client.handshake.query?.token;

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        client.data.user = {
            userId: decoded.sub,
            username: decoded.username,
            role:decoded.role
      }; 
      return true;
    } catch (error) {
      console.error(' WebSocket Authentication Failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
