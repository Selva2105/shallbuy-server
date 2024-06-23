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

  public getAllProducts = asyncErrorHandler(
    async (req: Request, res: Response): Promise<void> => {
      const filters = req.query;
      const products = await this.productService.getAllProducts(filters);
      res.json({
        status: 'success',
        message: 'Products fetched successfully',
        length: products.length,
        data: products,
      });
    },
  );

  public getProductById = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const productId = req.params.id;
      const product = await this.productService.getProductById(productId || '');
      if (!product) {
        const error = new CustomError('Product not found', 404);
        next(error);
      }
      res.json({
        status: 'success',
        message: 'Product fetched successfully',
        data: product,
      });
    },
  );

  public updateProduct = asyncErrorHandler(
    async (
      req: Request,
      res: Response,
      _next: NextFunction,
    ): Promise<Response | void> => {
      const productId = req.params.id;
      const productData = req.body;
      const { file } = req;
      const updatedProduct = await this.productService.updateProduct(
        productId || '',
        productData,
        file,
      );
      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    },
  );
}
