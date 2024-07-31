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
      const { id } = req.params;
      const { status, productId } = req.body;

      const hasRole = await this.orderService.checkRole(id || '');
      const isUser = await this.orderService.checkUser(id || '');
      const allProductsChecked =
        await this.orderService.checkAllProducts(productId);
      // const createOrder = await this.orderService.createOrder(req.body);

      if (hasRole && isUser && allProductsChecked) {
        // _next(createOrder);
        res.status(200).json({
          status: 'success',
          message: 'Ordered successfully',
          data: { id, status, productId },
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to process order',
        });
      }
    },
  );
}
