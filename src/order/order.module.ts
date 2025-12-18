import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../database/entities/order.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { ExternalModule } from '../external/external.module';
import { OrderRepository } from './repositories/order.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Customer]), ExternalModule],
  providers: [OrderRepository, CustomerRepository, OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
