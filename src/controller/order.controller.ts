import type { NextFunction, Request, Response } from 'express';

import type { OrderService } from '@/services/order.service';
import type { CreateOrderData } from '@/types/order';
import asyncErrorHandler from '@/utils/asyncErrorHandler';
import CustomError from '@/utils/customError';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  public createOrder = asyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.id) {
        return next(new CustomError('User not authenticated', 401));
      }

      const orderData = req.body as CreateOrderData;

      if (!orderData || Object.keys(orderData).length === 0) {
        return next(new CustomError('Order data is required', 400));
      }

      const order = await this.orderService.createOrder(req.user.id, orderData);

      return res.status(201).json({
        status: 'success',
        message: 'Order created successfully',
        data: order,
      });
    },
  );
}