import type { OrderRepository } from '@/repositories/order.repo';
import type { CreateOrderData } from '@/types/order';
import CustomError from '@/utils/customError';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async createOrder(userId: string, orderData: CreateOrderData) {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    const user = await this.orderRepository.findUserById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (!orderData || Object.keys(orderData).length === 0) {
      throw new CustomError('Order data is required', 400);
    }

    try {
      return await this.orderRepository.createOrder(userId, orderData);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create order', 500);
    }
  }
}
