import type { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import jwt from 'jsonwebtoken';

import type { SafeUser, UserRepository } from '@/repositories/auth.repo';
import CustomError from '@/utils/customError';
import DateTimeUtils from '@/utils/dateUtils';
import type Mailer from '@/utils/mailer';
import type TokenService from '@/utils/SignToken';
import emailTemplate from '@/view/email-template';

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

initializeApp(firebaseConfig);

const storage = getStorage();
/**
 * UserService class provides methods to manage user operations such as registration,
 * login, email verification, user profile management, and more.
 */
export class UserService {
  private userRepository: UserRepository;

  private mailer: Mailer;

  private tokenService: TokenService;

  /**
   * Constructs a new instance of UserService.
   * @param userRepository - Repository for user data interaction.
   * @param mailer - Mailer service for sending emails.
   * @param tokenService - Service for token generation and validation.
   */
  constructor(
    userRepository: UserRepository,
    mailer: Mailer,
    tokenService: TokenService,
  ) {
    this.userRepository = userRepository;
    this.mailer = mailer;
    this.tokenService = tokenService;
  }

  /**
   * Registers a new user with the provided user data and sends a verification email.
   * @param userData - The data of the user to register.
   * @returns The registered user with token or null if registration fails.
   */
  async registerUser(
    userData: Prisma.UserCreateInput & {
      addresses?: Prisma.AddressCreateInput[];
    },
  ) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomError('User already exists with this email', 409);
    }

    const user = await this.userRepository.findOrCreate(userData);

    if (user) {
      const token = this.tokenService.signToken(user.id);

      const mailOptions = {
        from: process.env.ADMIN_MAILID || 'default-email@example.com',
        to: user.email,
        subject: 'Welcome to Sky kart! Verify your email',
        html: emailTemplate(
          `https://shallbuy-server.onrender.com/api/v1/auth/verifyEmail/${user.emailVerificationToken}`,
          user.username,
        ),
      };
      await this.mailer.sendMail(mailOptions);

      const userWithAddresses = await this.userRepository.findUserWithAddresses(
        user.id,
      );
      return { user: userWithAddresses, token };
    }
    return null;
  }

  /**
   * Authenticates a user with provided email and password.
   * @param email - User's email.
   * @param password - User's password.
   * @returns Authenticated user with token or null if authentication fails.
   */
  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = this.tokenService.signToken(user.id);
      user.isActive = true;
      await this.userRepository.updateUserActivity(user.id, true);
      const userWithAddresses = await this.userRepository.findUserWithAddresses(
        user.id,
      );
      return { user: userWithAddresses, token };
    }
    return null;
  }

  /**
   * Verifies a user's email using a token.
   * @param token - Token for email verification.
   * @returns The verified user or null if verification fails.
   */
  public async verifyUserEmail(token: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailVerificationToken(token);

    if (
      !user ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return null;
    }

    await this.userRepository.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      auditLogs: {
        push: {
          action: 'Verification',
          timestamp: new Date(),
          details: 'User email verification was successfully done',
        },
      },
    });

    return user;
  }

  /**
   * Retrieves all users.
   * @returns Array of users.
   */
  public async getAllUsers(): Promise<SafeUser[]> {
    return this.userRepository.findAllUsers();
  }

  /**
   * Retrieves a user by their ID.
   * @param userId - The ID of the user to retrieve.
   * @returns The user if found, otherwise null.
   */
  async getUserById(userId: string): Promise<SafeUser | null> {
    return this.userRepository.findUserWithAddresses(userId);
  }

  /**
   * Deletes a user by their ID.
   * @param userId - The ID of the user to delete.
   */
  async deleteUserById(userId: string): Promise<void> {
    return this.userRepository.deleteUserById(userId);
  }

  /**
   * Changes the password of a user.
   * @param userId - The ID of the user.
   * @param currentPassword - Current password of the user.
   * @param newPassword - New password to set.
   * @returns True if the password was successfully changed.
   */
  async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new CustomError('Current password is incorrect', 401);
    }

    return this.userRepository.updatePassword(userId, newPassword);
  }

  /**
   * Updates user settings related to two-factor authentication.
   * @param userId - The ID of the user.
   * @param twoFactorEnabled - Boolean indicating if two-factor should be enabled.
   * @returns The updated user or null if update fails.
   */
  async updateUserSettings(
    userId: string,
    twoFactorEnabled: boolean,
  ): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    await this.userRepository.updateUser(userId, { twoFactorEnabled });

    return this.userRepository.findUserWithAddresses(userId);
  }

  /**
   * Updates user settings related to two-factor authentication.
   * @param userId - The ID of the user.
   * @param twoFactorEnabled - Boolean indicating if two-factor should be enabled.
   * @returns The updated user or null if update fails.
   */
  async uploadUserProfile(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const dateTime = DateTimeUtils.giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `images/user/${`${file.originalname} ${dateTime}`}`,
    );
    const metadata = { contentType: file.mimetype };

    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );
    const profileUrl = await getDownloadURL(snapshot.ref);

    await this.userRepository.updateUser(userId, {
      profilePicture: profileUrl,
    });

    return profileUrl;
  }

  /**
   * Uploads and updates the profile picture of a user.
   * @param userId - The ID of the user.
   * @param file - File data of the new profile picture.
   * @returns URL of the uploaded profile picture or null if upload fails.
   */
  async updateUserProfile(
    userId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Delete existing profile picture if it exists
    if (user.profilePicture) {
      const imagePath = decodeURIComponent(user.profilePicture)
        .split('/o/')[1]
        ?.split('?')[0];
      if (imagePath) {
        await this.userRepository.deleteProfilePicture(imagePath);
      }
    }

    // Upload new profile picture
    const dateTime = DateTimeUtils.giveCurrentDateTime();
    const newProfileUrl = await this.userRepository.uploadProfilePicture(
      file,
      dateTime,
    );
    await this.userRepository.updateUser(userId, {
      profilePicture: newProfileUrl,
    });
  }

  /**
   * Logs out a user by revoking their authentication token.
   * @param token - The token to revoke.
   */
  async logoutUser(token: string): Promise<void> {
    const decodedToken = jwt.verify(
      token,
      process.env.SECRET_STR || '',
    ) as jwt.JwtPayload;

    if (!decodedToken.exp) {
      throw new CustomError('Expiration time is missing in the token', 401);
    }
    const expiresAt = new Date(decodedToken.exp * 1000);

    await this.userRepository.revokeToken(token, expiresAt);

    const userId = decodedToken.id;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    await this.userRepository.deactivateUser(userId);
  }

  /**
   * Updates user information and addresses.
   * @param userId - The ID of the user to update.
   * @param updates - Object containing fields to update.
   * @param addresses - Array of addresses to update.
   * @returns The updated user or null if update fails.
   */
  async updateUserById(
    userId: string,
    updates: any,
    addresses: any[],
  ): Promise<SafeUser> {
    const restrictedFields = [
      'email',
      'profilePicture',
      'password',
      'role',
      'backupCodes',
      'emailVerificationToken',
      'emailVerificationExpires',
      'passwordResetToken',
      'passwordResetExpires',
    ];
    const isRestrictedFieldUpdated = Object.keys(updates).some((field) =>
      restrictedFields.includes(field),
    );

    if (isRestrictedFieldUpdated) {
      throw new CustomError('Cannot update restricted fields', 400);
    }

    return this.userRepository.updateUserAndAddresses(
      userId,
      updates,
      addresses,
    );
  }
}
