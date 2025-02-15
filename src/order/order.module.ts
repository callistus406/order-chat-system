import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderRepository } from '../common/repository/order.repository';
import { OrderController } from './order.controller';

@Module({
  providers: [OrderService, OrderRepository],
  controllers:[OrderController]
})
export class OrderModule {}
