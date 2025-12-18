import { Injectable, NotFoundException } from '@nestjs/common';

import { OrderRepository } from './repositories/order.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import ResponseCreateOrder from './dto/responseCreateOrder.interface';
import { PaginatedResult } from './dto/paginateResult.interface';
import { Order } from '../database/entities/order.entity';
import ResponseDeleteOrder from './dto/responseDeleteOrder.interface';
import { ExternalValidationService } from '../external/validation/external-validation.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly externalValidationService: ExternalValidationService,
  ) {}
  async getOrderById(id: number): Promise<Order | null> {
    try {
      const order = await this.orderRepository.findOne(id);
      if (!order) {
        // error not found
        throw new NotFoundException('Order not found');
      }
      return order;
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
      const customer = await this.customerRepository.getOne(
        createOrderDto.customerId,
      );
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      const order = await this.orderRepository.create(createOrderDto);
      const validationStatus =
        await this.externalValidationService.validateOrder();
      order.status = validationStatus;
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
    updateOrderDto: Partial<UpdateOrderDto>,
  ): Promise<Order> {
    try {
      const order = await this.getOrderById(id);
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return await this.orderRepository.update(id, updateOrderDto);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<ResponseDeleteOrder> {
    try {
      const order = await this.getOrderById(id);
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      await this.orderRepository.delete(id);
      return { message: 'Order deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
