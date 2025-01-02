import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '../common/repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { CustomException } from '../common/exceptions/custom.exception';

@Injectable()
export class OrderService {
  constructor(private readonly oderRepository: OrderRepository) {}

  public async createOrder(createOrder: CreateOrderDto, userId: number) {
    const response = await this.oderRepository.createOrder(createOrder, userId);
    return response;
  }

  public async getUserOrders(userId: number) {
    if (!userId || (userId && isNaN(userId)))
      throw new CustomException(
        'Invalid userId',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const orders = await this.oderRepository.getUserOrders(
      parseInt(userId.toString()),
    );

    return orders;
  }

  public async adminGetOrders() {
    return this.oderRepository.findAllOrders();
  }

  public async adminGetOrderById(orderId: number) {
    if (!orderId || (orderId && isNaN(orderId)))
      throw new CustomException(
        'Invalid orderId',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const order = await this.oderRepository.findOrderById(
      parseInt(orderId.toString()),
    );
    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  public async updateOrderStatus(orderId: number, status: OrderStatus) {
    if (!orderId || (orderId && isNaN(orderId)))
      throw new CustomException(
        'Invalid orderId',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    return this.oderRepository.updateOrderStatus(
      parseInt(orderId.toString()),
      status,
    );
  }
}
