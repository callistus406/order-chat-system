import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty({ message: 'Status is required' })
  status: OrderStatus;
}
