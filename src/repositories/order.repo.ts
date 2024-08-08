import type {
  Address,
  Order,
  PaymentMethod,
  PrismaClient,
  User,
} from '@prisma/client';
import { OrderStatus, PaymentStatus, TrackingStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

import type { CreateOrderData } from '@/types/order';
import CustomError from '@/utils/customError';

export class OrderRepository {
  private prisma: PrismaClient;

  private static generateTrackingId(): string {
    const randomPart = randomBytes(4).toString('hex').toUpperCase();
    const suffix = randomBytes(1).toString('hex').toUpperCase();
    return `TRK-${randomPart}-${suffix}`;
  }

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async createOrder(
    userId: string,
    orderData: CreateOrderData,
  ): Promise<Order> {
    const trackingId = OrderRepository.generateTrackingId();
    const orderDate = new Date();
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    try {
      // Fetch the seller's address for the first product

      if (!orderData.products.length && orderData.products !== undefined) {
        throw new CustomError('Products are required', 400);
      }
      const sellerAddress = await this.prisma.address.findFirst({
        where: { userId: orderData?.products[0]?.sellerId, isPrimary: true },
        select: { city: true, state: true },
      });

      const sellerLocation = `${sellerAddress?.city ?? 'Unknown'}, ${sellerAddress?.state ?? 'Unknown'}`;

      return await this.prisma.order.create({
        data: {
          userId,
          total: orderData.total,
          status: OrderStatus.PENDING,
          shippingAddressId: orderData.shippingAddressId,
          paymentMethod: orderData.paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          products: {
            create: orderData.products.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
              price: product.price,
              sellerId: product.sellerId,
            })),
          },
          trackingInfo: {
            create: {
              trackingId,
              carrier: 'FedEx',
              status: TrackingStatus.ORDER_PLACED,
              estimatedDelivery,
              trackingEvents: {
                create: {
                  status: TrackingStatus.ORDER_PLACED,
                  description: 'Order has been placed',
                  timestamp: new Date(),
                  location: sellerLocation,
                },
              },
            },
          },
        },
        include: {
          products: true,
          trackingInfo: true,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create order', 500);
    }
  }

  async findSellerAddressById(addressId: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id: addressId },
    });
  }

  public getUserAdminRoleOrders = async (
    userId: string,
    filters: any,
  ): Promise<any> => {
    const {
      sortBy,
      sortOrder = 'asc',
      // page = 1,
      // pageSize = 10
    } = filters;

    // Sorting
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    }

    // Pagination
    // const skip = (page - 1) * pageSize;
    // const take = parseInt(pageSize, 10);

    const orders = await this.prisma.user.findUnique({
      where: { id: userId },
      // orderBy,
      // skip,
      // take,
      include: {
        OrderProduct: true,
      },
    });
    return orders;
  };

  public getOrdersById = async (orderId: string): Promise<any> => {
    const orders = await this.prisma.order.findMany({
      where: { id: orderId },
      select: {
        products: true,
      },
    });
    return orders;
  };

  public checkOrderId = async (orderId: string): Promise<string | null> => {
    const checkOrderId = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
      },
    });
    return checkOrderId ? checkOrderId.id : null;
  };
}
