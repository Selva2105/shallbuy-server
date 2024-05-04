import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../app';
import type { Request as CustomRequest } from '../types/express';
import CustomError from '../utils/customError';

export class ProtectMiddleware {
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
  }
}
