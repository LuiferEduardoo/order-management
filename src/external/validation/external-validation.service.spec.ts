import { Test, TestingModule } from '@nestjs/testing';
import { ExternalValidationService } from './external-validation.service';
import { OrderStatus } from '../../database/entities/order.entity';

describe('ExternalValidationService', () => {
  let service: ExternalValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalValidationService],
    }).compile();

    service = module.get<ExternalValidationService>(ExternalValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('validateOrder', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return OrderStatus.CONFIRMED on successful validation', async () => {
      // Mock Math.random to always return > 0.3 (success case)
      jest.spyOn(Math, 'random').mockReturnValue(0.8);

      const result = await service.validateOrder();

      expect(result).toBe(OrderStatus.CONFIRMED);
    });

    it('should return OrderStatus.CANCELLED on failed validation', async () => {
      // Mock Math.random to always return <= 0.3 (failure case)
      jest.spyOn(Math, 'random').mockReturnValue(0.2);

      const result = await service.validateOrder();

      expect(result).toBe(OrderStatus.CANCELLED);
    });

    it('should simulate network latency', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.8);

      const startTime = Date.now();
      await service.validateOrder();
      const endTime = Date.now();

      // Should take at least 800ms (simulated latency)
      expect(endTime - startTime).toBeGreaterThanOrEqual(700);
    });

    it('should handle edge case when Math.random returns exactly 0.3', async () => {
      // Mock Math.random to return exactly 0.3 (should be cancelled as per <= 0.3)
      jest.spyOn(Math, 'random').mockReturnValue(0.3);

      const result = await service.validateOrder();

      expect(result).toBe(OrderStatus.CANCELLED);
    });

    it('should handle edge case when Math.random returns exactly 0', async () => {
      // Mock Math.random to return exactly 0 (should be cancelled)
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.validateOrder();

      expect(result).toBe(OrderStatus.CANCELLED);
    });

    it('should handle edge case when Math.random returns exactly 1', async () => {
      // Mock Math.random to return exactly 1 (should be confirmed)
      jest.spyOn(Math, 'random').mockReturnValue(0.999999);

      const result = await service.validateOrder();

      expect(result).toBe(OrderStatus.CONFIRMED);
    });

    it('should work with multiple consecutive calls', async () => {
      // Test multiple calls to ensure no state leakage between calls
      const results: OrderStatus[] = [];

      // Mock different outcomes for consecutive calls
      const mockValues = [0.8, 0.2, 0.9, 0.1, 0.7];
      let callIndex = 0;

      jest.spyOn(Math, 'random').mockImplementation(() => {
        return mockValues[callIndex++];
      });

      for (let i = 0; i < 5; i++) {
        const result = await service.validateOrder();
        results.push(result);
      }

      expect(results).toEqual([
        OrderStatus.CONFIRMED, // 0.8 > 0.3
        OrderStatus.CANCELLED, // 0.2 <= 0.3
        OrderStatus.CONFIRMED, // 0.9 > 0.3
        OrderStatus.CANCELLED, // 0.1 <= 0.3
        OrderStatus.CONFIRMED, // 0.7 > 0.3
      ]);
    });

    it('should not throw errors during normal operation', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.8);

      await expect(service.validateOrder()).resolves.not.toThrow();
    });

    it('should maintain consistent behavior with different execution speeds', async () => {
      // Test that the service behaves consistently regardless of execution timing
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const promises = Array(10)
        .fill(null)
        .map(() => service.validateOrder());
      const results = await Promise.all(promises);

      // All calls should return the same result for the same mock value
      expect(results.every((result) => result === OrderStatus.CONFIRMED)).toBe(
        true,
      );
    });

    it('should handle rapid succession of calls without interference', async () => {
      // Test that rapid calls don't interfere with each other
      const promises = [];

      // Set up different mock values for each call
      const mockValues = [0.1, 0.4, 0.6, 0.2, 0.8];
      let callIndex = 0;

      jest.spyOn(Math, 'random').mockImplementation(() => {
        return mockValues[callIndex++];
      });

      // Make calls rapidly
      for (let i = 0; i < 5; i++) {
        promises.push(service.validateOrder());
      }

      const results = await Promise.all(promises);

      expect(results).toEqual([
        OrderStatus.CANCELLED, // 0.1 <= 0.3
        OrderStatus.CONFIRMED, // 0.4 > 0.3
        OrderStatus.CONFIRMED, // 0.6 > 0.3
        OrderStatus.CANCELLED, // 0.2 <= 0.3
        OrderStatus.CONFIRMED, // 0.8 > 0.3
      ]);
    });
  });

  describe('service configuration', () => {
    it('should use the correct simulation delay', async () => {
      const delaySpy = jest.spyOn(global, 'setTimeout');
      jest.spyOn(Math, 'random').mockReturnValue(0.8);

      await service.validateOrder();

      // Check that setTimeout was called with 800ms delay
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 800);

      delaySpy.mockRestore();
    });

    it('should use the correct failure threshold', async () => {
      // Test various values around the 0.3 threshold
      const testCases = [
        { value: 0.2999999, expected: OrderStatus.CANCELLED },
        { value: 0.3, expected: OrderStatus.CANCELLED },
        { value: 0.3000001, expected: OrderStatus.CONFIRMED },
        { value: 0.4, expected: OrderStatus.CONFIRMED },
        { value: 0.5, expected: OrderStatus.CONFIRMED },
      ];

      for (const testCase of testCases) {
        jest.spyOn(Math, 'random').mockReturnValue(testCase.value);
        const result = await service.validateOrder();
        expect(result).toBe(testCase.expected);

        jest.clearAllMocks();
      }
    });
  });
});
