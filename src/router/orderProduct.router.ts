import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';

import { OrderProductsController } from '@/controller/orderProducts.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { OrderProductRepository } from '@/repositories/orderProduct.repo';
import { OrderService } from '@/services/orderProduct.service';
import CustomError from '@/utils/customError';
import orderProductValidators from '@/validators/orderProducts.validators';

const router = Router();

const prisma = new PrismaClient();
const orderProductRepository = new OrderProductRepository(prisma);
const orderService = new OrderService(orderProductRepository);
const orderProductsController = new OrderProductsController(orderService);

router.post(
  '/orderRequest',
  ProtectMiddleware.protect,
  orderProductValidators,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors
        .array()
        .map((err: any) => ({ field: err.path, message: err.message }));
      const customError = new CustomError(
        'Validation error',
        404,
        validationErrors,
      );
      next(customError);
    } else {
      orderProductsController.order(req, res, next);
    }
  },
);
