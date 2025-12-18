import { PartialType } from '@nestjs/mapped-types';

import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

import { OrderStatus } from '../../database/entities/order.entity';

export class CreateOrderDto {
  @IsNumber()
  customerId: number;

  @IsString()
  sku: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  totalAmount: number;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
