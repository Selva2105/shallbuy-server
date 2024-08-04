import type { NextFunction, Request, Response } from 'express';

import type { OrderService } from '@/services/orderProduct.service';
import asyncErrorHandler from '@/utils/asyncErrorHandler';

export class OrderProductsController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  public order = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId, deliveryAddress, modeOfPayment, products, total } =
        req.body;

      const checkUser = await this.orderService.checkUser(userId);
      if (!checkUser) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found',
        });
      }
      const { present, notPresent } =
        await this.orderService.checkProducts(products);
      if (notPresent.length > 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'Some products are not available',
          unavailableProducts: notPresent,
        });
      }
      if (present.length === products.length) {
        const newAddress = await this.orderService.createAddress({
          userId,
          ...deliveryAddress,
        });

        const newOrder = await this.orderService.createOrder({
          userId,
          deliveryAddressId: newAddress.id,
          modeOfPayment,
          products,
          total,
          status: 'PENDING',
        });
        return res.status(201).json({
          status: 'success',
          message: 'Order created successfully',
          data: newOrder,
        });
      }
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid product list',
      });
    },
  );
}
