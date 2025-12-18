import { Injectable } from '@nestjs/common';

import { OrderRepository } from './repositories/order.repository';
import { CreateOrderDto } from './dto/order.dto';
import ResponseCreateOrder from './dto/responseCreateOrder.interface';
import { PaginatedResult } from './dto/paginateResult.interface';
import { Order } from 'src/database/entities/order.entity';
import ResponseDeleteOrder from './dto/responseDeleteOrder.interface';
import { ExternalValidationService } from 'src/external/validation/external-validation.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly externalValidationService: ExternalValidationService,
  ) {}
  async getOrderById(id: number): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllOrders(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Order>> {
    try {
      return await this.orderRepository.findAll({ page, limit });
    } catch (error) {
      throw error;
    }
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<ResponseCreateOrder> {
    try {
      const order = await this.orderRepository.create(createOrderDto);
      const validationStatus =
        await this.externalValidationService.validateOrder();
      await this.orderRepository.update(order.id, { status: validationStatus });
      return {
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateOrderDto: Partial<CreateOrderDto>,
  ): Promise<Order> {
    try {
      return await this.orderRepository.update(id, updateOrderDto);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<ResponseDeleteOrder> {
    try {
      await this.orderRepository.delete(id);
      return { message: 'Order deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
