import type { NextFunction, Request, Response } from 'express';
import path from 'path';

import type { UserService } from '@/services/auth.services';
import asyncHandler from '@/utils/asyncErrorHandler';
import CustomError from '@/utils/customError';

/**
 * UserController class handles all HTTP requests related to user operations.
 * It provides methods for user registration, login, profile management, and more.
 */
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Registers a new user with the provided user data.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public register = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const user = await this.userService.registerUser(req.body);
      if (!user) {
        res.status(401).json({
          status: 'fail',
          message: 'Invalid email or password',
        });
      } else {
        res.status(201).json({
          status: 'success',
          message: 'User created successfully',
          user: user.user,
          token: user.token,
        });
      }
    },
  );

  /**
   * Authenticates a user with provided email and password.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;
      const user = await this.userService.loginUser(email, password);
      if (!user) {
        const error = new CustomError('Invalid email or password', 401);
        next(error);
      } else {
        res.status(200).json({
          status: 'success',
          message: 'User logged in successfully',
          user: user.user,
          token: user.token,
        });
      }
    },
  );

  /**
   * Verifies a user's email using a token.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public verifyEmail = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { emailVerificationToken } = req.params;
      const user = await this.userService.verifyUserEmail(
        emailVerificationToken || '',
      );

      if (!user) {
        const error = new CustomError(
          'Invalid or expired verification token',
          400,
        );
        return next(error);
      }

      res.sendFile(path.join(__dirname, '../view/email-result.html'));
      return undefined;
    },
  );

  /**
   * Retrieves all registered users.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public getAllUsers = asyncHandler(
    async (
      _req: Request,
      res: Response,
      _next: NextFunction,
    ): Promise<void> => {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        status: 'success',
        length: users.length,
        message: 'All users fetched successfully',
        users,
      });
    },
  );

  /**
   * Retrieves a single user by their ID.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public getUserById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await this.userService.getUserById(req.params.id || '');

      if (!user) {
        const error = new CustomError('User not found', 404);
        next(error);
      } else {
        res.status(200).json({
          status: 'success',
          message: `${user.username} details fetched successfully`,
          user,
        });
      }
    },
  );

  /**
   * Deletes a user by their ID.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public deleteUserById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await this.userService.getUserById(req.params.id || '');

      if (!user) {
        const error = new CustomError('User not found', 404);
        next(error);
      }

      await this.userService.deleteUserById(req.params.id || '');

      res.status(204).json({
        status: 'success',
        message: `User and associated addresses deleted successfully`,
      });
    },
  );

  /**
   * Changes the password for a user identified by ID.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        next(
          new CustomError(
            'New password and confirm new password do not match',
            400,
          ),
        );
      }

      const success = await this.userService.changeUserPassword(
        id || '',
        currentPassword,
        newPassword,
      );

      if (!success) {
        next(new CustomError('Password change failed', 400));
      }

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    },
  );

  /**
   * Updates user settings related to two-factor authentication.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public updateUserSettings = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const { twoFactorEnabled } = req.body;

      const user = await this.userService.updateUserSettings(
        id || '',
        twoFactorEnabled,
      );

      if (!user) {
        next(new CustomError('User not found', 404));
      }

      res.status(200).json({
        status: 'success',
        message: 'Settings updated successfully',
        user,
      });
    },
  );

  /**
   * Uploads a profile picture for a user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public uploadProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      if (!req.file) {
        next(new CustomError('No file uploaded', 400));
        return;
      }
      try {
        await this.userService.updateUserProfile(id || '', req.file);
        const updatedUser = await this.userService.getUserById(id || '');
        if (!updatedUser) {
          next(new CustomError('User not found', 404));
          return;
        }
        res.status(200).json({
          status: 'success',
          message: 'User profile updated successfully',
          profileUrl: updatedUser.profilePicture,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * Updates the profile picture of a user by their ID.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public updateUserProfileById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      if (!req.file) {
        next(new CustomError('No file uploaded', 400));
        return;
      }
      try {
        await this.userService.updateUserProfile(id || '', req.file);
        const updatedUser = await this.userService.getUserById(id || '');
        if (!updatedUser) {
          next(new CustomError('User not found', 404));
          return;
        }
        res.status(200).json({
          status: 'success',
          message: 'User profile updated successfully',
          profileUrl: updatedUser.profilePicture,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * Logs out a user by revoking their authentication token.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        next(new CustomError('Authorization header is missing', 401));
        return;
      }

      const token = authHeader.split(' ')[1];
      await this.userService.logoutUser(token || '');
      res
        .status(200)
        .json({ status: 'success', message: 'Logged out successfully' });
    },
  );

  /**
   * Updates a user's profile information by their ID.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param next - The next middleware function in the stack.
   */
  public updateUserById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const { addresses, ...rest } = req.body;

      try {
        const updatedUser = await this.userService.updateUserById(
          id || '',
          rest,
          addresses,
        );
        res.status(200).json({
          status: 'success',
          message: 'User updated successfully',
          user: updatedUser,
        });
      } catch (error) {
        next(error);
      }
    },
  );
}
