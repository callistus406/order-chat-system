import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private readonly requiredRole: string) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const user = client.data?.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (user.role !== this.requiredRole) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
