import type { PrismaClient } from '@prisma/client';

export class OrderProductRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async checkRole(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    return user !== null && user.role === 'USER';
  }

  public async findUserById(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    return user !== null;
  }

  public async checkProduct(productId: string): Promise<boolean> {
    const product = await this.prisma.user.findUnique({
      where: {
        id: productId,
      },
    });
    return product !== null;
  }

  // public async createOrder(order : Order): Promise<Order> {
  //   const newOrder = await this.prisma.order.create({
  //     data: {
  //       user: { connect : {id: order.id}},
  //       deliveryAddress: {
  //         create: {
  //           street: order.Address.street,
  //           city: order.address.city,
  //           district: order.address.district,
  //           state: order.address.state,
  //           country: order.address.country,
  //           pincode: order.address.pincode,
  //           user: { connect: { id: order.userId } },
  //         },
  //       },
  //       modeOfPayment: order.modeOfPayment,
  //       products: {
  //         create: order.products.map(productId => ({
  //           product: { connect: { id: productId } },
  //         })),
  //       },
  //     }
  //   });
  //   return newOrder;
  // }
  // public async createOrder(order : Prisma.OrderCreateInput): Promise<Order> {
  //   const newOrder = await this.prisma.order.create({
  //     data: {
  //       user: { connect : {id: order.userId}},
  //       deliveryAddress: {
  //         create: {
  //           street: order.deliveryAddress.create.street,
  //           city: order.deliveryAddress.create.city,
  //           district: order.address.district,
  //           state: order.address.state,
  //           country: order.address.country,
  //           pincode: order.address.pincode,
  //           user: { connect: { id: order.userId } },
  //         },
  //       },
  //       modeOfPayment: order.modeOfPayment,
  //       products: {
  //         create: order.products.map(productId => ({
  //           product: { connect: { id: productId } },
  //         })),
  //       },
  //     }
  //   });
  // return newOrder;
  // }
}
