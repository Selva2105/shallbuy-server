import type { Address, Order, Product } from '@prisma/client';

import type { OrderProductRepository } from '@/repositories/orderProduct.repo';
import CustomError from '@/utils/customError';

export class OrderService {
  private orderProductRepository: OrderProductRepository;

  constructor(orderProductRepository: OrderProductRepository) {
    this.orderProductRepository = orderProductRepository;
  }

  async checkUser(id: string) {
    const role = await this.orderProductRepository.findUser(id);
    return role;
  }

  async checkProducts(
    products: Product[],
  ): Promise<{ present: string[]; notPresent: string[] }> {
    return this.orderProductRepository.checkProducts(products);
  }

  /**
   * Creates a new order
   * @param orderData - The order data including user, address, and products
   * @returns The created order
   * @throws CustomError if order creation fails
   */
  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
      products: Array<{ productId: string; quantity: number }>;
    },
  ): Promise<Order> {
    try {
      return await this.orderProductRepository.createOrder(orderData);
    } catch (error) {
      throw new CustomError('Failed to create order', 500);
    }
  }

  async createAddress(addressData: Address) {
    return this.orderProductRepository.createAddress(addressData);
  }
}
