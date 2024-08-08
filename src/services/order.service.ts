import type { OrderRepository } from '@/repositories/order.repo';
import type { ProductRepository } from '@/repositories/product.repo';
import type { CreateOrderData } from '@/types/order';
import CustomError from '@/utils/customError';
import type Mailer from '@/utils/mailer';
import orderConfirmationTemplate from '@/view/orderConfirmationTemplate';

export class OrderService {
  private orderRepository: OrderRepository;

  private productRepository: ProductRepository;

  private mailer: Mailer;

  private static formatAddress(address: {
    street: string;
    landmark?: string | null;
    city: string;
    district?: string | null;
    state: string;
    country: string;
    pincode: string;
  }): string {
    const parts = [
      address.street,
      address.landmark,
      address.city,
      address.district,
      address.state,
      address.country,
      address.pincode,
    ];
    return parts.filter((part) => part).join(', ');
  }

  constructor(
    orderRepository: OrderRepository,
    productRepository: ProductRepository,
    mailer: Mailer,
  ) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.mailer = mailer;
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
      // Fetch product details and shipping address in parallel
      const [productDetailsList, shippingAddress] = await Promise.all([
        this.productRepository.findProductsByIds(
          orderData.products.map((product) => product.productId),
        ),
        this.orderRepository.findSellerAddressById(orderData.shippingAddressId),
      ]);

      if (!shippingAddress) {
        throw new CustomError('Shipping address not found', 404);
      }

      const products = orderData.products.map((product) => {
        const productDetails = productDetailsList.find(
          (p) => p.id === product.productId,
        );
        return {
          name: productDetails?.name ?? 'Unknown Product',
          quantity: product.quantity,
          total: (productDetails?.price ?? 0) * product.quantity,
          image: productDetails?.images ?? '',
          productPrice: productDetails?.discountedPrice
            ? `${productDetails.discountedPrice}`
            : `${productDetails?.price}`,
          variants: productDetails?.variants ?? [],
        };
      });

      const formattedAddress = OrderService.formatAddress({
        street: shippingAddress.street,
        landmark: shippingAddress.landmark,
        city: shippingAddress.city,
        district: shippingAddress.district,
        state: shippingAddress.state,
        country: shippingAddress.country,
        pincode: shippingAddress.pincode,
      });

      // Create order and send email in a transaction
      const order = await this.orderRepository.createOrder(userId, orderData);

      const mailOptions = {
        from: process.env.ADMIN_MAILID || 'default-email@example.com',
        to: user.email,
        subject: 'Order Confirmation',
        html: orderConfirmationTemplate(
          order.id,
          order.total,
          products,
          formattedAddress,
        ),
      };
      await this.mailer.sendMail(mailOptions);

      return order;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create order', 500);
    }
  }
}
