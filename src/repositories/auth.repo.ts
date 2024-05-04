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

/**
 * UserRepository class handles all database operations related to user management.
 */
export class UserRepository {
  private prisma: PrismaClient;

  private firebaseStorage: FirebaseStorage;

  constructor(prismaClient: PrismaClient, firebaseApp: FirebaseApp) {
    this.prisma = prismaClient;
    this.firebaseStorage = getStorage(firebaseApp);
  }

  /**
   * Finds an existing user by email or creates a new one if not found.
   * @param userData - Data for creating or finding a user.
   * @returns A promise that resolves to the user object.
   */
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

  /**
   * Finds a user by their email.
   * @param email - The email to search for.
   * @returns A promise that resolves to the user object or null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Updates the activity status of a user.
   * @param id - The user's ID.
   * @param isActive - The new activity status.
   * @returns A promise that resolves to the updated user object.
   */
  async updateUserActivity(id: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Finds a user by their email verification token.
   * @param token - The token to search for.
   * @returns A promise that resolves to the user object or null.
   */
  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
  }

  /**
   * Updates a user's data.
   * @param id - The user's ID.
   * @param updates - An object containing the fields to update.
   * @returns A promise that resolves to the updated user object.
   */
  async updateUser(id: string, updates: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Retrieves all users with selected safe fields.
   * @returns A promise that resolves to an array of SafeUser objects.
   */
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

  /**
   * Retrieves a user along with their addresses by user ID.
   * @param userId - The ID of the user to retrieve.
   * @returns A promise that resolves to a SafeUser object containing user details and addresses, or null if the user is not found.
   */
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

  /**
   * Deletes a user by their ID.
   * @param userId - The ID of the user to delete.
   * @returns A promise that resolves when the user and their associated data have been deleted.
   */
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

  /**
   * Finds a user by their ID.
   * @param userId - The ID of the user to find.
   * @returns A promise that resolves to the user object or null.
   */
  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Updates a user's password.
   * @param userId - The ID of the user.
   * @param newPassword - The new password to set.
   * @returns A promise that resolves to true if the update was successful.
   */
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const update = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return !!update;
  }

  /**
   * Deletes a user's profile picture from storage.
   * @param imagePath - The path to the image to delete.
   * @returns A promise that resolves when the image has been deleted.
   */
  async deleteProfilePicture(imagePath: string): Promise<void> {
    const imageRef = ref(this.firebaseStorage, imagePath);
    await deleteObject(imageRef);
  }

  /**
   * Uploads a profile picture to storage and returns the URL.
   * @param file - The file to upload.
   * @param dateTime - The date and time to append to the file name for uniqueness.
   * @returns A promise that resolves to the URL of the uploaded image.
   */
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

  /**
   * Revokes a user's authentication token.
   * @param token - The token to revoke.
   * @param expiresAt - The expiration date of the token.
   * @returns A promise that resolves when the token has been successfully revoked.
   */
  async revokeToken(token: string, expiresAt: Date): Promise<void> {
    await this.prisma.revokedToken.create({
      data: { token, expiresAt },
    });
  }

  /**
   * Deactivates a user's account.
   * @param userId - The ID of the user.
   * @returns A promise that resolves when the user's account has been deactivated.
   */
  async deactivateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  /**
   * Updates user information and addresses.
   * @param userId - The ID of the user to update.
   * @param updates - Object containing fields to update.
   * @param addresses - Array of addresses to update.
   * @returns The updated user or null if update fails.
   */
  async updateUserAndAddresses(
    userId: string,
    updates: Prisma.UserUpdateInput,
    addresses: Prisma.AddressCreateInput[] = [],
  ): Promise<SafeUser> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
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
