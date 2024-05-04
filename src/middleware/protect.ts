import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../app';
import type { Request as CustomRequest } from '../types/express';
import CustomError from '../utils/customError';

/**
 * ProtectMiddleware class provides methods to secure routes by verifying user tokens.
 * It ensures that the user is authenticated and the token is not revoked.
 */
export class ProtectMiddleware {
  /**
   * Middleware to protect routes and ensure the user is authenticated.
   * It checks for the token in the authorization header, verifies it, checks if it's revoked,
   * and ensures the user exists in the database.
   *
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function in the stack.
   * @throws {CustomError} If the user is not logged in, token is revoked, or user does not exist.
   */
  static async protect(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer')) {
      [, token] = authHeader.split(' ');
    }

    if (!token) {
      return next(new CustomError('You are not logged in', 401));
    }

    const isBlacklisted = await prisma.revokedToken.findUnique({
      where: { token },
    });

    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: 'Token revoked. Please log in again.' });
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.SECRET_STR as string,
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decodedToken.id },
      });

      if (!user) {
        return next(
          new CustomError("The user with the given token doesn't exist", 401),
        );
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new CustomError('Token has expired', 401));
      }
      return next(new CustomError('Authentication failed', 401));
    }
  }
}
