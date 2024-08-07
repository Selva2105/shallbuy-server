import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';

import { OrderController } from '@/controller/order.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { OrderRepository } from '@/repositories/order.repo';
import { OrderService } from '@/services/order.service';
import CustomError from '@/utils/customError';
import { createOrderValidator } from '@/validators/order.validators';

const router = Router();
const prisma = new PrismaClient();

const orderRepository = new OrderRepository(prisma);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.post(
  '/create',
  ProtectMiddleware.protect,
  createOrderValidator,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors
        .array()
        .map((err: any) => `${err.msg} (${err.param}: ${err.value})`)
        .join(', ');
      const customError = new CustomError(
        `Validation error: ${validationErrors}`,
        400,
      );
      return next(customError);
    }
    return orderController.createOrder(req, res, next);
  },
);

router.get(
  '/orders',
  ProtectMiddleware.protect,
  (req: Request, res: Response, next: NextFunction) => {
    return orderController.getOrders(req, res, next);
  },
);

router.get(
  '/orders/:id',
  ProtectMiddleware.protect,
  (req: Request, res: Response, next: NextFunction) => {
    return orderController.getOrdersById(req, res, next);
  },
);
export default router;
