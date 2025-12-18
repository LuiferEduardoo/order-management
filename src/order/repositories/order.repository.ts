import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto';
import { PaginationDto } from '../dto/paginatio.dto';
import { PaginatedResult } from '../dto/paginateResult.interface';
import { Order, OrderStatus } from 'src/database/entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  /**
   * Crear una nueva orden
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.repository.create(createOrderDto);
    return await this.repository.save(order);
  }

  /**
   * Obtener una orden por ID
   */
  async findOne(id: number): Promise<Order | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Obtener todas las órdenes con paginación
   */
  async findAll(
    paginationDto: PaginationDto = {},
  ): Promise<PaginatedResult<Order>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualizar una orden
   */
  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order | null> {
    const order = await this.findOne(id);

    if (!order) {
      return null;
    }

    Object.assign(order, updateOrderDto);
    return await this.repository.save(order);
  }

  /**
   * Eliminar una orden (soft delete)
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  /**
   * Eliminar permanentemente una orden
   */
  async hardDelete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Restaurar una orden eliminada (soft delete)
   */
  async restore(id: number): Promise<boolean> {
    const result = await this.repository.restore(id);
    return result.affected > 0;
  }

  /**
   * Buscar órdenes por customerId con paginación
   */
  async findByCustomerId(
    customerId: number,
    paginationDto: PaginationDto = {},
  ): Promise<PaginatedResult<Order>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { customerId },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar órdenes por estado con paginación
   */
  async findByStatus(
    status: OrderStatus,
    paginationDto: PaginationDto = {},
  ): Promise<PaginatedResult<Order>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { status },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
