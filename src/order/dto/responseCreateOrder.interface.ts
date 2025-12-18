import { Order } from 'src/database/entities/order.entity';

export default interface ResponseCreateOrder {
  message: string;
  data: Order;
}
