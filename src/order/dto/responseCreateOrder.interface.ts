import { Order } from '../../database/entities/order.entity';

export default interface ResponseCreateOrder {
  message: string;
  data: Order;
}
