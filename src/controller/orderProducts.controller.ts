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

      res.status(201).json({
        status: 'success',
        message: 'Order created successfully',
        data: newOrder,
      });
    },
  );
}
