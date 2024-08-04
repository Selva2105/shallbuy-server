import type { Address, Order, PrismaClient, Product } from '@prisma/client';

export class OrderProductRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (user != null) {
      return true;
    }
    return false;
  }

  // async checkProducts(products : Product []): Promise< {present: string[] , notPresent: string[]}>{
  //   const productsPresent: string[]=[];
  //   const productsNotPresent: string[]=[];
  //   for(const product of products){
  //     const exists = await this.prisma.product.findUnique({
  //       where: {id: product.id},
  //       select: { id: true}
  //     })
  //     if (exists) {
  //       productsPresent.push(product.id);
  //     } else {
  //       productsNotPresent.push(product.id);
  //     }
  //   }
  //   return { present: productsPresent, notPresent: productsNotPresent };
  // }

  async checkProducts(
    products: Product[],
  ): Promise<{ present: string[]; notPresent: string[] }> {
    const productIds = products.map((product) => product.id);

    const existingProducts = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: { id: true },
    });

    const existingProductIds = new Set(existingProducts.map((p) => p.id));

    const present = productIds.filter((id) => existingProductIds.has(id));
    const notPresent = productIds.filter((id) => !existingProductIds.has(id));

    return { present, notPresent };
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
          create: await Promise.all(
            orderData.products.map(async (product) => {
              const tracking = await this.prisma.trackingItem.create({
                data: {
                  status: 'PENDING',
                  // trackingId: `TRK-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  location: 'Order Processing',
                  time: new Date(),
                },
              });

              return {
                product: { connect: { id: product.productId } },
                quantity: product.quantity,
                tracking: { connect: { id: tracking.id } },
              };
            }),
          ),
        },
      },
      include: {
        products: {
          include: {
            product: true,
            tracking: true,
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
