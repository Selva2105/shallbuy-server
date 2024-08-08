import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';

import { firebaseConfig } from '@/config/firebaseConfig';
import { OrderController } from '@/controller/order.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { OrderRepository } from '@/repositories/order.repo';
import { ProductRepository } from '@/repositories/product.repo';
import { OrderService } from '@/services/order.service';
import CustomError from '@/utils/customError';
import Mailer from '@/utils/mailer';
import { createOrderValidator } from '@/validators/order.validators';

const router = Router();
const prisma = new PrismaClient();

const orderRepository = new OrderRepository(prisma);
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const productRepository = new ProductRepository(prisma, firebaseApp);
const mailer = new Mailer();
const orderService = new OrderService(
  orderRepository,
  productRepository,
  mailer,
);
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

export default router;
