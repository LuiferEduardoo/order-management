import { Injectable } from '@nestjs/common';

import { OrderStatus } from 'src/database/entities/order.entity';

@Injectable()
export class ExternalValidationService {
  async validateOrder(): Promise<OrderStatus> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simula fallo aleatorio (30%)
    const success = Math.random() > 0.3;

    return success ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
  }
}
