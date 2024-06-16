import type { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import type { FirebaseApp } from 'firebase/app';

import type { UserRepository } from '@/repositories/auth.repo';
import asyncErrorHandler from '@/utils/asyncErrorHandler';
import CustomError from '@/utils/customError';

import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor(
    prismaClient: PrismaClient,
    firebaseApp: FirebaseApp,
    userRepository: UserRepository,
  ) {
    this.productService = new ProductService(
      prismaClient,
      firebaseApp,
      userRepository,
    );
  }

  public createProduct = asyncErrorHandler(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response | void> => {
      if (!req.file) {
        return next(new CustomError('No file uploaded', 400));
      }
      const productData = req.body;
      const product = await this.productService.createProduct(
        productData,
        req.file,
      );
      return res.status(201).json(product);
    },
  );
}
