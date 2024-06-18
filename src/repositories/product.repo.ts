import type { Prisma, PrismaClient, Product } from '@prisma/client';
import type { FirebaseApp } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import DateTimeUtils from '@/utils/dateUtils';

export class ProductRepository {
  private prisma: PrismaClient;

  private firebaseStorage: FirebaseStorage;

  constructor(prismaClient: PrismaClient, firebaseApp: FirebaseApp) {
    this.prisma = prismaClient;
    this.firebaseStorage = getStorage(firebaseApp);
  }

  public getAllProducts = async (filters: any): Promise<any> => {
    const {
      priceGreaterThan,
      priceLessThan,
      category,
      name,
      sortBy,
      sortOrder = 'asc', // Default sort order
      page = 1, // Default page
      pageSize = 10, // Default page size
    } = filters;

    const query: any = {};

    // Price filtering
    if (priceGreaterThan) {
      query.price = { ...query.price, gt: parseFloat(priceGreaterThan) };
    }
    if (priceLessThan) {
      query.price = { ...query.price, lt: parseFloat(priceLessThan) };
    }

    // Category filtering
    if (category) {
      query.category = category;
    }

    // Name filtering
    if (name) {
      query.name = { contains: name, mode: 'insensitive' };
    }

    // Sorting
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    }

    // Pagination
    const skip = (page - 1) * pageSize;
    const take = parseInt(pageSize, 10);

    return this.prisma.product.findMany({
      where: query,
      orderBy,
      skip,
      take,
    });
  };

  public findUnique = async (
    options: Prisma.ProductFindUniqueArgs,
  ): Promise<Product | null> => {
    return this.prisma.product.findUnique(options);
  };

  async uploadProductPicture(
    file: Express.Multer.File,
    dateTime: string,
  ): Promise<string> {
    const storageRef = ref(
      this.firebaseStorage,
      `images/product/${file.originalname} ${dateTime}`,
    );
    const metadata = { contentType: file.mimetype };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );
    return getDownloadURL(snapshot.ref);
  }

  public createProduct = async (
    productData: any,
    productPicture: string,
  ): Promise<any> => {
    const discountPercentage = parseFloat(productData.discountPercentage);
    const discountedPrice =
      productData.price - (productData.price * discountPercentage) / 100;
    return this.prisma.product.create({
      data: {
        ...productData,
        price: parseFloat(productData.price),
        quantity: parseInt(productData.quantity, 10),
        images: productPicture,
        discountedPrice,
      },
    });
  };

  public updateProduct = async (
    productId: string,
    productData: any,
    file?: Express.Multer.File,
  ): Promise<Product> => {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });

    let newProfileUrl;
    if (file) {
      // Delete the existing product picture only if a new file is provided
      if (existingProduct && existingProduct.images) {
        await this.deleteProductPicture(existingProduct.images);
      }
      const dateTime = DateTimeUtils.giveCurrentDateTime();
      newProfileUrl = await this.uploadProductPicture(file, dateTime);
    }

    // Ensure discountPercentage is a float
    const discountPercentage = parseFloat(productData.discountPercentage);
    const discountedPrice =
      productData.price - (productData.price * discountPercentage) / 100;

    const updateData = {
      ...productData,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity, 10),
      discountPercentage, // Now correctly formatted as a float
      discountedPrice,
      ...(newProfileUrl && { images: newProfileUrl }),
    };

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  };

  async deleteProductPicture(filePath: string): Promise<void> {
    const fileRef = ref(this.firebaseStorage, filePath);
    await deleteObject(fileRef);
  }
}
