import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { PaginationDto } from './dto/paginatio.dto';

@Controller({ path: 'orders', version: '1' })
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    return this.orderService.getOrderById(id);
  }

  @Get('')
  async getAllOrders(@Query() pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    return this.orderService.getAllOrders(page, limit);
  }

  @Post('')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: number) {
    return this.orderService.delete(id);
  }
}
