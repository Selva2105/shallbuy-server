import type { OrderProductRepository } from '@/repositories/orderProduct.repo';
import CustomError from '@/utils/customError';

export class OrderService {
  private orderProductRepository: OrderProductRepository;

  constructor(orderProductRepository: OrderProductRepository) {
    this.orderProductRepository = orderProductRepository;
  }

  async checkRole(userId: string): Promise<boolean> {
    const role = await this.orderProductRepository.checkRole(userId);
    if (!role) {
      throw new CustomError('Role is not user', 404);
    }
    return role;
  }

  public async checkUser(userId: string): Promise<boolean> {
    const user = await this.orderProductRepository.findUserById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return this.checkRole(userId);
  }

  public async checkAllProducts(orderProduct: string[]): Promise<any[]> {
    const productsPresent = [];
    const productsNotPresent = [];
    for (const productCode of orderProduct) {
      const product = this.orderProductRepository.checkProduct(productCode);
      if (product == null) {
        productsNotPresent.push(productCode);
        throw new CustomError('This product not found', 404);
      }
      productsPresent.push(product);
    }
    return productsPresent;
  }

  // public async createOrder(orderData :OrderData ){
  //   return orderData;
  // }
  // public async reCheckProducts(productsNotPresent : string[]): Promise<any[]> {

  // }
}
