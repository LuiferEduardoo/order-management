import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from './order.repository';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { PaginationDto } from '../dto/paginatio.dto';
import { PaginatedResult } from '../dto/paginateResult.interface';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let typeormRepository: jest.Mocked<Repository<Order>>;

  const mockOrder: Order = {
    id: 1,
    customerId: 1,
    customer: {} as any,
    sku: 'TEST-001',
    quantity: 2,
    price: 100.0,
    totalAmount: 200.0,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCreateOrderDto: CreateOrderDto = {
    customerId: 1,
    sku: 'TEST-001',
    quantity: 2,
    price: 100.0,
    totalAmount: 200.0,
  };

  beforeEach(async () => {
    const mockTypeormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn(),
      delete: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: getRepositoryToken(Order),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
    typeormRepository = module.get(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      const createdOrder = { ...mockOrder };
      typeormRepository.create.mockReturnValue(createdOrder);
      typeormRepository.save.mockResolvedValue(createdOrder);

      const result = await repository.create(mockCreateOrderDto);

      expect(typeormRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(typeormRepository.save).toHaveBeenCalledWith(createdOrder);
      expect(result).toEqual(createdOrder);
    });

    it('should throw error when create operation fails', async () => {
      const error = new Error('Database connection failed');
      typeormRepository.create.mockReturnValue(mockOrder);
      typeormRepository.save.mockRejectedValue(error);

      await expect(repository.create(mockCreateOrderDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return an order when found', async () => {
      typeormRepository.findOne.mockResolvedValue(mockOrder);

      const result = await repository.findOne(1);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order is not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should throw error when findOne operation fails', async () => {
      const error = new Error('Database query failed');
      typeormRepository.findOne.mockRejectedValue(error);

      await expect(repository.findOne(1)).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('findAll', () => {
    const mockPaginatedResult: PaginatedResult<Order> = {
      data: [mockOrder],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return paginated orders with default pagination', async () => {
      typeormRepository.findAndCount.mockResolvedValue([[mockOrder], 1]);

      const result = await repository.findAll();

      expect(typeormRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated orders with custom pagination', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const customPaginatedResult: PaginatedResult<Order> = {
        data: [mockOrder],
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      };

      typeormRepository.findAndCount.mockResolvedValue([[mockOrder], 25]);

      const result = await repository.findAll(paginationDto);

      expect(typeormRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(customPaginatedResult);
    });

    it('should calculate totalPages correctly', async () => {
      const mockOrders = [mockOrder, { ...mockOrder, id: 2 }];
      typeormRepository.findAndCount.mockResolvedValue([mockOrders, 25]);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.totalPages).toBe(3);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty result set', async () => {
      const emptyPaginatedResult: PaginatedResult<Order> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      typeormRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findAll();

      expect(result).toEqual(emptyPaginatedResult);
    });

    it('should throw error when findAndCount operation fails', async () => {
      const error = new Error('Database query failed');
      typeormRepository.findAndCount.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const updateData = { quantity: 5, price: 150.0 };
      const updatedOrder = { ...mockOrder, ...updateData };

      typeormRepository.findOne.mockResolvedValue(mockOrder);
      typeormRepository.save.mockResolvedValue(updatedOrder);

      const result = await repository.update(1, updateData);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(typeormRepository.save).toHaveBeenCalledWith(updatedOrder);
      expect(result).toEqual(updatedOrder);
    });

    it('should return null when order to update is not found', async () => {
      const updateData = { quantity: 5 };

      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.update(999, updateData);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(typeormRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const updateData = { status: OrderStatus.CANCELLED };
      const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      typeormRepository.findOne.mockResolvedValue(mockOrder);
      typeormRepository.save.mockResolvedValue(updatedOrder);

      const result = await repository.update(1, updateData);

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.sku).toBe(mockOrder.sku); // Should keep other properties
    });

    it('should throw error when findOne operation fails during update', async () => {
      const error = new Error('Database query failed');
      const updateData = { quantity: 5 };

      typeormRepository.findOne.mockRejectedValue(error);

      await expect(repository.update(1, updateData)).rejects.toThrow(
        'Database query failed',
      );
      expect(typeormRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when save operation fails', async () => {
      const error = new Error('Database save failed');
      const updateData = { quantity: 5 };

      typeormRepository.findOne.mockResolvedValue(mockOrder);
      typeormRepository.save.mockRejectedValue(error);

      await expect(repository.update(1, updateData)).rejects.toThrow(
        'Database save failed',
      );
    });
  });

  describe('delete', () => {
    it('should soft delete an order successfully', async () => {
      const mockDeleteResult: UpdateResult = {
        raw: {},
        affected: 1,
        generatedMaps: [],
      };
      typeormRepository.softDelete.mockResolvedValue(mockDeleteResult);

      const result = await repository.delete(1);

      expect(typeormRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when no rows affected during delete', async () => {
      const mockDeleteResult: UpdateResult = {
        raw: {},
        affected: 0,
        generatedMaps: [],
      };
      typeormRepository.softDelete.mockResolvedValue(mockDeleteResult);

      const result = await repository.delete(999);

      expect(typeormRepository.softDelete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });

    it('should throw error when soft delete operation fails', async () => {
      const error = new Error('Database delete failed');
      typeormRepository.softDelete.mockRejectedValue(error);

      await expect(repository.delete(1)).rejects.toThrow(
        'Database delete failed',
      );
    });
  });

  describe('hardDelete', () => {
    it('should hard delete an order successfully', async () => {
      const mockDeleteResult = { affected: 1, raw: {} };
      typeormRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await repository.hardDelete(1);

      expect(typeormRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when no rows affected during hard delete', async () => {
      const mockDeleteResult = { affected: 0, raw: {} };
      typeormRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await repository.hardDelete(999);

      expect(typeormRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });

    it('should throw error when hard delete operation fails', async () => {
      const error = new Error('Database hard delete failed');
      typeormRepository.delete.mockRejectedValue(error);

      await expect(repository.hardDelete(1)).rejects.toThrow(
        'Database hard delete failed',
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted order successfully', async () => {
      const mockRestoreResult = { affected: 1, raw: {}, generatedMaps: [] };
      typeormRepository.restore.mockResolvedValue(mockRestoreResult);

      const result = await repository.restore(1);

      expect(typeormRepository.restore).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when no rows affected during restore', async () => {
      const mockRestoreResult = { affected: 0, raw: {}, generatedMaps: [] };
      typeormRepository.restore.mockResolvedValue(mockRestoreResult);

      const result = await repository.restore(999);

      expect(typeormRepository.restore).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });

    it('should throw error when restore operation fails', async () => {
      const error = new Error('Database restore failed');
      typeormRepository.restore.mockRejectedValue(error);

      await expect(repository.restore(1)).rejects.toThrow(
        'Database restore failed',
      );
    });
  });
});
