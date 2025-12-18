import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from 'src/database/entities/order.entity';

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

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class UpdateOrderDto implements Partial<CreateOrderDto> {}
