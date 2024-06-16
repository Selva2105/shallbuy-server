import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import multer from 'multer';

import { ProductController } from '@/controller/product.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { UserRepository } from '@/repositories/auth.repo';
import CustomError from '@/utils/customError';
import { createProductValidator } from '@/validators/product.validators';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

dotenv.config();

export const firebaseConfig = {
  apiKey: process.env.FB_APIKEY,
  authDomain: process.env.FB_AUTHDOMAIN,
  projectId: process.env.FB_PROJECTID,
  databaseURL: process.env.FB_DBURL,
  storageBucket: process.env.FB_STORAGEBUCKET,
  messagingSenderId: process.env.FB_MESSAGINGSENDERID,
  appId: process.env.FB_APPID,
  measurementId: process.env.FB_MEASUREMENTID,
};

const prisma = new PrismaClient();
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const userRepository = new UserRepository(prisma, firebaseApp);
const productController = new ProductController(
  prisma,
  firebaseApp,
  userRepository,
);

// {{URL}}/api/v1/products?name=Ultra HD 4K TV&category=ELECTRONICS&quantity=50&priceGreaterThan=4999&sortBy=price&sortOrder=desc&sortBy=name&sortOrder=asc
router.get('/', productController.getAllProducts);

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
  productController.createProduct,
);

export default router;
