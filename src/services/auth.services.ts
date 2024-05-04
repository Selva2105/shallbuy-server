import type { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { initializeApp } from 'firebase/app';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import jwt from 'jsonwebtoken';

import { firebaseConfig } from '@/config/firebaseConfig';
import type { SafeUser, UserRepository } from '@/repositories/auth.repo';
import CustomError from '@/utils/customError';
import DateTimeUtils from '@/utils/dateUtils';
import type Mailer from '@/utils/mailer';
import type TokenService from '@/utils/SignToken';
import emailTemplate from '@/view/email-template';

initializeApp(firebaseConfig);

const storage = getStorage();

export class UserService {
  private userRepository: UserRepository;

  private mailer: Mailer;

  private tokenService: TokenService;

  constructor(
    userRepository: UserRepository,
    mailer: Mailer,
    tokenService: TokenService,
  ) {
    this.userRepository = userRepository;
    this.mailer = mailer;
    this.tokenService = tokenService;
  }

  async registerUser(
    userData: Prisma.UserCreateInput & {
      addresses?: Prisma.AddressCreateInput[];
    },
  ) {
    const user = await this.userRepository.findOrCreate(userData);
    if (user) {
      const token = this.tokenService.signToken(user.id);

      // Prepare the email content
      const mailOptions = {
        from: process.env.ADMIN_MAILID || 'default-email@example.com',
        to: user.email,
        subject: 'Welcome to Sky kart! Verify your email',
        html: emailTemplate(
          `https://ecom-server-beta.vercel.app/api/v1/auth/verifyEmail/${user.emailVerificationToken}`,
          user.username,
        ),
      };
      await this.mailer.sendMail(mailOptions);

      // Ensure addresses are included in the response
      const userWithAddresses = await this.userRepository.findUserWithAddresses(
        user.id,
      );
      return { user: userWithAddresses, token };
    }
    return null;
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = this.tokenService.signToken(user.id);
      user.isActive = true;
      await this.userRepository.updateUserActivity(user.id, true);
      // Ensure addresses are included in the response
      const userWithAddresses = await this.userRepository.findUserWithAddresses(
        user.id,
      );
      return { user: userWithAddresses, token };
    }
    return null;
  }

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

  public async getAllUsers(): Promise<SafeUser[]> {
    return this.userRepository.findAllUsers();
  }

  async getUserById(userId: string): Promise<SafeUser | null> {
    return this.userRepository.findUserWithAddresses(userId);
  }

  async deleteUserById(userId: string): Promise<void> {
    return this.userRepository.deleteUserById(userId);
  }

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
