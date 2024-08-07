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

  async getOrders(userId: string) {
    if (!userId) {
      throw new CustomError('User ID is required', 400);
    }

    const user = await this.orderRepository.findUserById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const userRole = await this.orderRepository.findUserById(userId);
    if (userRole == null) {
      throw new CustomError('User role not defined', 404);
    }

    if (userRole === 'USER' || userRole === 'ADMIN') {
      return this.getUserAdminRoleOrders(userId);
    }
    return null;
  }

  async getUserAdminRoleOrders(userId: string) {
    const filters = {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        lte: new Date(),
      },
    };
    return this.orderRepository.getUserAdminRoleOrders(userId, filters);
  }

  async checkOrderId(orderId: string) {
    const checkId = await this.orderRepository.checkOrderId(orderId);
    return checkId;
  }

  async getOrdersById(orderId: string) {
    const checkOrderId = await this.checkOrderId(orderId);
    if (checkOrderId == null) {
      throw new CustomError('Failed to fetch the orders', 500);
    }
    return this.orderRepository.getOrdersById(orderId);
  }
}
