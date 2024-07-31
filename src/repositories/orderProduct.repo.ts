import type { Address, Order, PrismaClient } from '@prisma/client';

export class OrderProductRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
      products: Array<{ productId: string; quantity: number }>;
    },
  ): Promise<Order> {
    return this.prisma.order.create({
      data: {
        user: { connect: { id: orderData.userId } },
        deliveryAddress: { connect: { id: orderData.deliveryAddressId } },
        modeOfPayment: orderData.modeOfPayment,
        total: orderData.total,
        status: orderData.status,
        products: {
          create: orderData.products.map((product) => ({
            product: { connect: { id: product.productId } },
            quantity: product.quantity,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async createAddress(addressData: Address) {
    return this.prisma.address.create({
      data: addressData,
    });
  }
}
