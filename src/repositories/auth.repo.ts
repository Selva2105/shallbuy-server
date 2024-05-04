import type { Prisma, PrismaClient, Role, User } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { FirebaseApp } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

interface ExtendedUserCreateInput extends Prisma.UserCreateInput {
  confirmPassword?: string;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  contactno: string;
  profilePicture: string | null;
  dateOfBirth: Date | null;
  role: Role;
  preferences: JsonValue;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  addresses: {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  private prisma: PrismaClient;

  private firebaseStorage: FirebaseStorage;

  constructor(prismaClient: PrismaClient, firebaseApp: FirebaseApp) {
    this.prisma = prismaClient;
    this.firebaseStorage = getStorage(firebaseApp);
  }

  async findOrCreate(userData: ExtendedUserCreateInput): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { confirmPassword, ...cleanUser } = userData;
      // Hash password if it's a new or modified password
      if (cleanUser.password) {
        cleanUser.password = await bcrypt.hash(cleanUser.password, 12);
      }
      // Generate email verification token
      cleanUser.emailVerificationToken = crypto.randomBytes(20).toString('hex');
      cleanUser.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      user = await this.prisma.user.create({
        data: {
          ...cleanUser,
          addresses: {
            create: Array.isArray(cleanUser.addresses)
              ? cleanUser.addresses.map((address) => ({
                  ...address,
                }))
              : [],
          },
          preferences: cleanUser.preferences || {
            language: 'en',
            currency: 'USD',
          },
        },
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUserActivity(id: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
  }

  async updateUser(id: string, updates: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updates,
    });
  }

  async findAllUsers(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        contactno: true,
        profilePicture: true,
        dateOfBirth: true,
        role: true,
        preferences: true,
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        password: false,
        emailVerificationToken: false,
        emailVerificationExpires: false,
        backupCodes: false,
        passwordResetExpires: false,
        passwordResetToken: false,
        auditLogs: false,
        twoFactorSecret: false,
        addresses: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserWithAddresses(userId: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        contactno: true,
        profilePicture: true,
        dateOfBirth: true,
        role: true,
        preferences: true,
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        password: false,
        emailVerificationToken: false,
        emailVerificationExpires: false,
        backupCodes: false,
        passwordResetExpires: false,
        passwordResetToken: false,
        auditLogs: false,
        twoFactorSecret: false,
        addresses: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUserById(userId: string): Promise<void> {
    // Delete addresses first
    await this.prisma.address.deleteMany({
      where: { userId },
    });

    // Then delete the user
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const update = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return !!update;
  }

  async deleteProfilePicture(imagePath: string): Promise<void> {
    const imageRef = ref(this.firebaseStorage, imagePath);
    await deleteObject(imageRef);
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
    dateTime: string,
  ): Promise<string> {
    const storageRef = ref(
      this.firebaseStorage,
      `images/user/${file.originalname} ${dateTime}`,
    );
    const metadata = { contentType: file.mimetype };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );
    return getDownloadURL(snapshot.ref);
  }

  async revokeToken(token: string, expiresAt: Date): Promise<void> {
    await this.prisma.revokedToken.create({
      data: { token, expiresAt },
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async updateUserAndAddresses(
    userId: string,
    updates: Prisma.UserUpdateInput,
    addresses: Prisma.AddressCreateInput[] = [],
  ): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        addresses: {
          upsert: addresses.map((address) => ({
            where: { id: address.id },
            update: {
              street: address.street,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              country: address.country,
              pincode: address.pincode,
              isPrimary: address.isPrimary,
              district: address.district,
            },
            create: {
              street: address.street,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              country: address.country,
              pincode: address.pincode,
              isPrimary: address.isPrimary,
              district: address.district,
            },
          })),
        },
        auditLogs: {
          push: {
            action: 'Updation',
            timestamp: new Date(),
            details: 'User details updated successfully',
          },
        },
      },
      include: {
        addresses: true,
      },
    });

    return user;
  }
}
