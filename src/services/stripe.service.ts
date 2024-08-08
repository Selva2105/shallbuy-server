// import Stripe from 'stripe';

// import CustomError from '@/utils/customError';

// import type { OrderService } from './order.service';

// export class StripeService {
//   private stripe: Stripe;

//   private orderService: OrderService;

//   constructor(stripeSecretKey: string, orderService: OrderService) {
//     this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
//     this.orderService = orderService;
//   }

//   async createPaymentIntent(amount: number, currency: string): Promise<string> {
//     try {
//       const paymentIntent = await this.stripe.paymentIntents.create({
//         amount,
//         currency,
//       });
//       return paymentIntent.client_secret;
//     } catch (error) {
//       throw new CustomError('Failed to create payment intent', 500);
//     }
//   }

//   async handleWebhook(payload: Buffer, signature: string): Promise<void> {
//     let event: Stripe.Event;

//     try {
//       event = this.stripe.webhooks.constructEvent(
//         payload,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET,
//       );
//     } catch (err) {
//       throw new CustomError('Webhook signature verification failed', 400);
//     }

//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object as Stripe.PaymentIntent;
//         await this.orderService.updateOrderStatus(
//           paymentIntent.metadata.orderId,
//           'PAID',
//         );
//         break;
//       case 'payment_intent.payment_failed':
//         const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
//         await this.orderService.updateOrderStatus(
//           failedPaymentIntent.metadata.orderId,
//           'FAILED',
//         );
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }
//   }
// }
