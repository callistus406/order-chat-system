import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ResponseDto } from '../common/dto/response.dto';

@Controller('api/v1')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/order')
  @Roles('USER')
  @UseGuards(RolesGuard)
  public async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const userId = req.user.userId;
    const response = await this.orderService.createOrder(
      createOrderDto,
      userId,
    );
    return new ResponseDto(HttpStatus.CREATED, 'Order created', response);
  }

  @Roles('USER')
  @UseGuards(RolesGuard)
  @Get('/orders')
  public async getOrders(@Request() req) {
    const userId = req.user.userId;
    const orders = await this.orderService.getUserOrders(userId);

    return new ResponseDto(
      HttpStatus.OK,
      'Orders retrieved Successfully',
      orders,
    );
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('admin/orders')
  public async adminGetOrders() {
    const orders = await this.orderService.adminGetOrders();

    return new ResponseDto(HttpStatus.OK, 'Order details retrieved', orders);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('admin/orders/:orderId')
  public async adminGetOrderById(
    @Request() req,
    @Param('orderId') orderId: number,
  ) {
    const response = await this.orderService.adminGetOrderById(orderId);

    return new ResponseDto(HttpStatus.OK, 'Order details retrieved', response);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch('order/:orderId/status')
  public async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const response = await this.orderService.updateOrderStatus(
      orderId,
      updateOrderDto.status,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Order Status successfully updated',
      response,
    );
  }
}
