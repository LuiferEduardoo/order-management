import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/database/entities/customer.entity';

export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}
  async getOne(id: number): Promise<Customer | null> {
    return this.repository.findOne({ where: { id } });
  }
}
