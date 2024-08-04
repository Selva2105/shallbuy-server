import type { OrderRepository } from '@/repositories/order.repo';
import CustomError from '@/utils/customError';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async createOrder(userId: string, orderData: any) {
    const user = await this.orderRepository.findUserById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return this.orderRepository.createOrder(userId, orderData);
  }
}
