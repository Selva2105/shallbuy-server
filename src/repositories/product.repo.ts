import type {
  Prisma,
  PrismaClient,
  Product,
  ProductVariant,
} from '@prisma/client';
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
      category,
      name,
      sortBy,
      sortOrder = 'asc',
      page = 1,
      pageSize = 10,
      priceMin,
      priceMax,
      discountMin,
      discountMax,
      sellerId,
    } = filters;

    const query: any = {};

    // Category filtering
    if (category) {
      query.category = category;
    }

    // Name filtering
    if (name) {
      query.name = { contains: name, mode: 'insensitive' };
    }

    // Price range filtering
    if (priceMin !== undefined && priceMax !== undefined) {
      query.price = {
        gte: parseFloat(priceMin),
        lte: parseFloat(priceMax),
      };
    }

    // Discount range filtering
    if (discountMin !== undefined && discountMax !== undefined) {
      query.discountPercentage = {
        gte: parseFloat(discountMin),
        lte: parseFloat(discountMax),
      };
    }

    // Seller filtering
    if (sellerId) {
      query.sellerId = sellerId;
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
      include: {
        variants: true,
        _count: {
          select: {
            variants: true,
          },
        },
      },
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
    // Ensure main product fields are correctly typed
    const price = parseFloat(productData.price);
    const discountPercentage = parseFloat(productData.discountPercentage);
    const discountedPrice = price - (price * discountPercentage) / 100;
    const quantity = parseInt(productData.quantity, 10);

    // Map over variants to ensure their fields are also correctly typed
    const typedVariants = productData.variants.map(
      (variant: ProductVariant) => ({
        type: variant.type,
        price: parseFloat(variant.price.toString()),
        discountPercentage: parseFloat(variant.discountPercentage.toString()),
        discountedPrice:
          parseFloat(variant.price.toString()) -
          (parseFloat(variant.price.toString()) *
            parseFloat(variant.discountPercentage.toString())) /
            100,
      }),
    );

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        price,
        discountPercentage,
        discountedPrice,
        images: productPicture,
        quantity,
        variants: {
          create: typedVariants,
        },
      },
      include: {
        variants: true,
      },
    });
    return product;
  };

  public updateProduct = async (
    productId: string,
    productData: any,
    file?: Express.Multer.File,
  ): Promise<Product> => {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
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

    // Update variants only if they are provided
    if (productData.variants && productData.variants.length > 0) {
      updateData.variants = {
        updateMany: productData.variants.map((variant: any) => ({
          where: { id: variant.id, productId },
          data: {
            type: variant.type,
            price: parseFloat(variant.price),
            discountPercentage: parseFloat(variant.discountPercentage),
            discountedPrice:
              parseFloat(variant.price) -
              (parseFloat(variant.price) *
                parseFloat(variant.discountPercentage)) /
                100,
          },
        })),
      };
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        variants: true, // Include variants in the response
      },
    });
  };

  async deleteProductPicture(filePath: string): Promise<void> {
    const fileRef = ref(this.firebaseStorage, filePath);
    await deleteObject(fileRef);
  }
}
