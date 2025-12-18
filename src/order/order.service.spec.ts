import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { ExternalValidationService } from '../external/validation/external-validation.service';
import { CreateOrderDto } from './dto/order.dto';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { PaginatedResult } from './dto/paginateResult.interface';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let externalValidationService: jest.Mocked<ExternalValidationService>;

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

  const mockPaginatedResult: PaginatedResult<Order> = {
    data: [mockOrder],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockOrderRepository = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockExternalValidationService = {
      validateOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: ExternalValidationService,
          useValue: mockExternalValidationService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(OrderRepository);
    externalValidationService = module.get(ExternalValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should return an order when found', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(1);

      expect(orderRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order is not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      const result = await service.getOrderById(999);

      expect(orderRepository.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      const error = new Error('Database connection failed');
      orderRepository.findOne.mockRejectedValue(error);

      await expect(service.getOrderById(1)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      orderRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.getAllOrders(1, 10);

      expect(orderRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated orders with custom page and limit', async () => {
      const customPaginatedResult: PaginatedResult<Order> = {
        data: [mockOrder],
        total: 50,
        page: 2,
        limit: 25,
        totalPages: 2,
      };

      orderRepository.findAll.mockResolvedValue(customPaginatedResult);

      const result = await service.getAllOrders(2, 25);

      expect(orderRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
      });
      expect(result).toEqual(customPaginatedResult);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Failed to fetch orders');
      orderRepository.findAll.mockRejectedValue(error);

      await expect(service.getAllOrders(1, 10)).rejects.toThrow(
        'Failed to fetch orders',
      );
    });
  });

  describe('createOrder', () => {
    it('should create an order successfully with confirmed status', async () => {
      const createdOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };

      orderRepository.create.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue(createdOrder);
      externalValidationService.validateOrder.mockResolvedValue(
        OrderStatus.CONFIRMED,
      );

      const result = await service.createOrder(mockCreateOrderDto);

      expect(orderRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(externalValidationService.validateOrder).toHaveBeenCalled();
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.CONFIRMED,
      });
      expect(result).toEqual({
        message: 'Order created successfully',
        data: createdOrder,
      });
    });

    it('should create an order successfully with cancelled status', async () => {
      const createdOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      orderRepository.create.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue(createdOrder);
      externalValidationService.validateOrder.mockResolvedValue(
        OrderStatus.CANCELLED,
      );

      const result = await service.createOrder(mockCreateOrderDto);

      expect(orderRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(externalValidationService.validateOrder).toHaveBeenCalled();
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.CANCELLED,
      });
      expect(result).toEqual({
        message: 'Order created successfully',
        data: createdOrder,
      });
    });

    it('should throw error when order creation fails', async () => {
      const error = new Error('Failed to create order');
      orderRepository.create.mockRejectedValue(error);

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(
        'Failed to create order',
      );
      expect(externalValidationService.validateOrder).not.toHaveBeenCalled();
    });

    it('should throw error when external validation fails', async () => {
      const validationError = new Error(
        'External validation service unavailable',
      );
      orderRepository.create.mockResolvedValue(mockOrder);
      externalValidationService.validateOrder.mockRejectedValue(
        validationError,
      );

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(
        'External validation service unavailable',
      );
      expect(orderRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(orderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when order update fails', async () => {
      const updateError = new Error('Failed to update order status');
      orderRepository.create.mockResolvedValue(mockOrder);
      externalValidationService.validateOrder.mockResolvedValue(
        OrderStatus.CONFIRMED,
      );
      orderRepository.update.mockRejectedValue(updateError);

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(
        'Failed to update order status',
      );
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const updateData = { quantity: 5, price: 150.0 };
      const updatedOrder = { ...mockOrder, ...updateData };

      orderRepository.update.mockResolvedValue(updatedOrder);

      const result = await service.update(1, updateData);

      expect(orderRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedOrder);
    });

    it('should update order with partial data', async () => {
      const updateData = { status: OrderStatus.CANCELLED };
      const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      orderRepository.update.mockResolvedValue(updatedOrder);

      const result = await service.update(1, updateData);

      expect(orderRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedOrder);
    });

    it('should return null when order to update is not found', async () => {
      orderRepository.update.mockResolvedValue(null);

      const result = await service.update(999, { quantity: 5 });

      expect(orderRepository.update).toHaveBeenCalledWith(999, { quantity: 5 });
      expect(result).toBeNull();
    });

    it('should throw error when update operation fails', async () => {
      const error = new Error('Database update failed');
      orderRepository.update.mockRejectedValue(error);

      await expect(service.update(1, { quantity: 5 })).rejects.toThrow(
        'Database update failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete an order successfully', async () => {
      orderRepository.delete.mockResolvedValue(true);

      const result = await service.delete(1);

      expect(orderRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Order deleted successfully' });
    });

    it('should throw error when order to delete is not found', async () => {
      orderRepository.delete.mockRejectedValue(new Error('Order not found'));

      await expect(service.delete(999)).rejects.toThrow('Order not found');
    });

    it('should throw error when delete operation fails', async () => {
      const error = new Error('Database delete failed');
      orderRepository.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow('Database delete failed');
    });
  });
});
