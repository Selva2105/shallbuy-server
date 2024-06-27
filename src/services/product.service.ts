import type { PrismaClient, Product } from '@prisma/client';
import type { FirebaseApp } from 'firebase/app';

import type { UserRepository } from '@/repositories/auth.repo';
import { ProductRepository } from '@/repositories/product.repo';
import DateTimeUtils from '@/utils/dateUtils';

export class ProductService {
  private productRepository: ProductRepository;

  private userRepository: UserRepository;

  constructor(
    prismaClient: PrismaClient,
    firebaseApp: FirebaseApp,
    userRepository: UserRepository,
  ) {
    this.productRepository = new ProductRepository(prismaClient, firebaseApp);
    this.userRepository = userRepository;
  }

  public getAllProducts = async (filters: any): Promise<any> => {
    return this.productRepository.getAllProducts(filters);
  };

  public async getProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            variants: true,
          },
        },
        variants: true,
      },
    });
  }

  public createProduct = async (
    productData: any,
    file: Express.Multer.File,
  ): Promise<any> => {
    const user = await this.userRepository.findUserByIdAndRole(
      productData.sellerId,
      ['SELLER', 'ADMIN'],
    );
    if (!user) {
      throw new Error('User does not exist or does not have the correct role');
    }
    const dateTime = DateTimeUtils.giveCurrentDateTime();
    const newProfileUrl = await this.productRepository.uploadProductPicture(
      file,
      dateTime,
    );

    return this.productRepository.createProduct(productData, newProfileUrl);
  };

  public updateProduct = async (
    productId: string,
    productData: any,
    file?: Express.Multer.File,
  ): Promise<Product> => {
    if (!productData.sellerId) {
      throw new Error('Seller ID is required');
    }
    const user = await this.userRepository.findUserByIdAndRole(
      productData.sellerId,
      ['SELLER', 'ADMIN'],
    );
    if (!user) {
      throw new Error('User does not exist or does not have the correct role');
    }

    return this.productRepository.updateProduct(productId, productData, file);
  };

  public deleteProduct = async (productId: string): Promise<void> => {
    const product = await this.productRepository.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    await this.productRepository.deleteProduct(productId);
  };
}
