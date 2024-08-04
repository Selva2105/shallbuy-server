import type { NextFunction, Request, Response } from 'express';

import type { OrderService } from '@/services/order.service';
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
        next(new CustomError('User not authenticated', 401));
        return;
      }

      const order = await this.orderService.createOrder(req.user.id, req.body);

      res.status(201).json({
        status: 'success',
        message: 'Order created successfully',
        data: order,
      });
    },
  );
}
