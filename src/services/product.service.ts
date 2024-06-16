import type { PrismaClient } from '@prisma/client';
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
}
