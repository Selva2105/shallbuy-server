import { PrismaClient, Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import multer from 'multer';

import { firebaseConfig } from '@/config/firebaseConfig';
import { ProductController } from '@/controller/product.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import RestrictMiddleware from '@/middleware/restrict';
import { UserRepository } from '@/repositories/auth.repo';
import CustomError from '@/utils/customError';
import { createProductValidator } from '@/validators/product.validators';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const prisma = new PrismaClient();
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const userRepository = new UserRepository(prisma, firebaseApp);
const productController = new ProductController(
  prisma,
  firebaseApp,
  userRepository,
);
const restrictMiddleware = new RestrictMiddleware(
  Role.ADMIN,
  Role.SELLER,
  Role.TESTER,
);

// {{URL}}/api/v1/products?name=Ultra HD 4K TV&category=ELECTRONICS&quantity=50&priceGreaterThan=4999&sortBy=price&sortOrder=desc&sortBy=name&sortOrder=asc
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/create',
  upload.single('file'),
  createProductValidator,
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new CustomError('Validation failed', 400, errors.array());
      return next(error);
    }
    return next();
  },
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  productController.createProduct,
);

router.patch(
  '/update/:id',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  upload.single('file'),
  productController.updateProduct,
);

router.delete(
  '/delete/:id',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  productController.deleteProduct,
);

export default router;
