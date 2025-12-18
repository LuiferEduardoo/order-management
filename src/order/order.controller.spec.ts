import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { PaginationDto } from './dto/paginatio.dto';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { PaginatedResult } from './dto/paginateResult.interface';
import { BadRequestException } from '@nestjs/common';
import ResponseCreateOrder from './dto/responseCreateOrder.interface';
import ResponseDeleteOrder from './dto/responseDeleteOrder.interface';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

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

  const mockUpdateOrderDto: UpdateOrderDto = {
    quantity: 5,
    price: 150.0,
  };

  const mockPaginatedResult: PaginatedResult<Order> = {
    data: [mockOrder],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockResponseCreateOrder: ResponseCreateOrder = {
    message: 'Order created successfully',
    data: mockOrder,
  };

  const mockResponseDeleteOrder: ResponseDeleteOrder = {
    message: 'Order deleted successfully',
  };

  beforeEach(async () => {
    const mockOrderService = {
      getOrderById: jest.fn(),
      getAllOrders: jest.fn(),
      createOrder: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should return an order when found', async () => {
      orderService.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById(1);

      expect(orderService.getOrderById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order is not found', async () => {
      orderService.getOrderById.mockResolvedValue(null);

      const result = await controller.getOrderById(999);

      expect(orderService.getOrderById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should throw error when service throws error', async () => {
      const error = new Error('Service error');
      orderService.getOrderById.mockRejectedValue(error);

      await expect(controller.getOrderById('1' as any)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders with default values', async () => {
      const mockPagination: PaginationDto = {};
      orderService.getAllOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllOrders(mockPagination);

      expect(orderService.getAllOrders).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated orders with provided pagination', async () => {
      const mockPagination: PaginationDto = { page: 2, limit: 25 };
      orderService.getAllOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllOrders(mockPagination);

      expect(orderService.getAllOrders).toHaveBeenCalledWith(2, 25);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle partial pagination parameters', async () => {
      const mockPagination: PaginationDto = { page: 3 };
      orderService.getAllOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllOrders(mockPagination);

      expect(orderService.getAllOrders).toHaveBeenCalledWith(3, 10);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty pagination object', async () => {
      const mockPagination: PaginationDto = {};
      orderService.getAllOrders.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllOrders(mockPagination);

      expect(orderService.getAllOrders).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should throw error when service throws error', async () => {
      const error = new Error('Failed to fetch orders');
      const mockPagination: PaginationDto = {};
      orderService.getAllOrders.mockRejectedValue(error);

      await expect(controller.getAllOrders(mockPagination)).rejects.toThrow(
        'Failed to fetch orders',
      );
    });
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      orderService.createOrder.mockResolvedValue(mockResponseCreateOrder);

      const result = await controller.createOrder(mockCreateOrderDto);

      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(result).toEqual(mockResponseCreateOrder);
    });

    it('should pass the correct DTO to service', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 123,
        sku: 'CUSTOM-SKU',
        quantity: 10,
        price: 99.99,
        totalAmount: 999.9,
      };

      orderService.createOrder.mockResolvedValue(mockResponseCreateOrder);

      await controller.createOrder(createOrderDto);

      expect(orderService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle service errors during creation', async () => {
      const error = new Error('Validation failed');
      orderService.createOrder.mockRejectedValue(error);

      await expect(controller.createOrder(mockCreateOrderDto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should handle null/undefined DTO gracefully', async () => {
      const emptyDto = {} as CreateOrderDto;
      orderService.createOrder.mockRejectedValue(
        new BadRequestException('Invalid order data'),
      );

      await expect(controller.createOrder(emptyDto)).rejects.toThrow(
        'Invalid order data',
      );
    });
  });

  describe('updateOrder', () => {
    it('should update an order successfully', async () => {
      const updatedOrder = { ...mockOrder, ...mockUpdateOrderDto };
      orderService.update.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(1, mockUpdateOrderDto);

      expect(orderService.update).toHaveBeenCalledWith(1, mockUpdateOrderDto);
      expect(result).toEqual(updatedOrder);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateOrderDto = { quantity: 8 };
      const updatedOrder = { ...mockOrder, quantity: 8 };
      orderService.update.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(1, partialUpdate);

      expect(orderService.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result).toEqual(updatedOrder);
    });

    it('should handle status updates', async () => {
      const statusUpdate: UpdateOrderDto = { status: OrderStatus.CANCELLED };
      const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      orderService.update.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(1, statusUpdate);

      expect(orderService.update).toHaveBeenCalledWith(1, statusUpdate);
      expect(result).toEqual(updatedOrder);
    });

    it('should return null when order to update is not found', async () => {
      orderService.update.mockResolvedValue(null);

      const result = await controller.updateOrder(999, mockUpdateOrderDto);

      expect(orderService.update).toHaveBeenCalledWith(999, mockUpdateOrderDto);
      expect(result).toBeNull();
    });

    it('should handle empty update DTO', async () => {
      const emptyUpdate: UpdateOrderDto = {};
      orderService.update.mockResolvedValue(mockOrder);

      const result = await controller.updateOrder(1, emptyUpdate);

      expect(orderService.update).toHaveBeenCalledWith(1, emptyUpdate);
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when service throws error during update', async () => {
      const error = new Error('Update failed');
      orderService.update.mockRejectedValue(error);

      await expect(
        controller.updateOrder(1, mockUpdateOrderDto),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order successfully', async () => {
      orderService.delete.mockResolvedValue(mockResponseDeleteOrder);

      const result = await controller.deleteOrder(1);

      expect(orderService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponseDeleteOrder);
    });

    it('should throw error when service throws error during delete', async () => {
      const error = new Error('Delete failed');
      orderService.delete.mockRejectedValue(error);

      await expect(controller.deleteOrder(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof controller.getOrderById).toBe('function');
      expect(typeof controller.getAllOrders).toBe('function');
      expect(typeof controller.createOrder).toBe('function');
      expect(typeof controller.updateOrder).toBe('function');
      expect(typeof controller.deleteOrder).toBe('function');
    });
  });
});
