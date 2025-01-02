import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../../order/dto/create-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository {
  constructor(private readonly orderModel: PrismaService) {}
  public async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const order = await this.orderModel.order.create({
      data: {
        description: createOrderDto.description,
        specification: createOrderDto.specifications,
        quantity: createOrderDto.quantity,
        user: {
          connect: { id: userId },
        },
        chatRoom: {
          create: {
            isClosed: false,
            summary: null,
          },
        },
      },
      include: {
        chatRoom: true, 
      },
    });

    return order;
  }

  async getUserOrders(userId: number) {
    return this.orderModel.order.findMany({
      where: { userId },
      include: {
        chatRoom: true,
      },
    });
  }
  public async findAllOrders() {
    return this.orderModel.order.findMany();
  }

  public async findOrderById(orderId: number) {
    const order = await this.orderModel.order.findUnique({
      where: { id: orderId },

      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return order;
  }

  public async updateOrderStatus(orderId: number, status: OrderStatus) {
    return this.orderModel.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
