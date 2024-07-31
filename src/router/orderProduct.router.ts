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

// Initialize dependencies
const prisma = new PrismaClient();
const orderProductRepository = new OrderProductRepository(prisma);
const orderService = new OrderService(orderProductRepository);
const orderProductsController = new OrderProductsController(orderService);

/**
 * Route to create a new order
 * @route POST /api/v1/orders/orderRequest
 * @param {string} req.body.userId - The ID of the user placing the order
 * @param {string} req.body.deliveryAddress - The ID of the delivery address
 * @param {string} req.body.modeOfPayment - The payment method
 * @param {Array} req.body.products - An array of product objects
 * @param {number} req.body.total - The total amount of the order
 * @returns {Object} 201 - The created order
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
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
        400,
        validationErrors,
      );
      next(customError);
    } else {
      orderProductsController.order(req, res, next);
    }
  },
);

export default router;
