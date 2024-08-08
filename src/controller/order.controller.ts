import type { NextFunction, Request, Response } from 'express';

import type { OrderService } from '@/services/order.service';
import type { CreateOrderData } from '@/types/order';
import asyncErrorHandler from '@/utils/asyncErrorHandler';
import CustomError from '@/utils/customError';

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
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

  public getOrders = asyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.id) {
        return next(new CustomError('User not authenticated', 401));
      }

      let orders;
      if (req.user.role === 'ADMIN') {
        orders = await this.orderService.getAllOrders();
      } else {
        orders = await this.orderService.getOrdersByUserId(req.user.id);
      }

      if (!orders || orders.length === 0) {
        return res.status(200).json({
          status: 'failed',
          message: 'No orders found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Orders fetched successfully',
        length: orders.length,
        data: orders,
      });
    },
  );

  public getOrdersById = asyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.id) {
        return next(new CustomError('User not authenticated', 401));
      }

      const orderId = req.params.id || '';
      const order = await this.orderService.getOrdersById(orderId);

      if (!order) {
        return res.status(404).json({
          status: 'failed',
          message: 'Order not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Order fetched successfully',
        data: order,
      });
    },
  );
}
