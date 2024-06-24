import type { NextFunction, Request, Response } from 'express';

import CustomError from '../utils/customError';

// Extend the Request interface to include the user property
interface CustomRequest extends Request {
  user?: {
    role?: string;
  };
}

class RestrictMiddleware {
  private roles: string[];

  constructor(...roles: string[]) {
    this.roles = roles;
  }

  public restrict = (
    req: CustomRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user || !req.user.role) {
      const error = new CustomError('Please login', 403);
      return next(error);
    }

    // 1. Check if user has the role exists in DB
    if (!this.roles.includes(req.user.role)) {
      const error = new CustomError(
        'You do not have the permission to perform this action',
        403,
      );
      return next(error);
    }

    // 2. If exists Allow(auth) the user
    return next();
  };
}

export default RestrictMiddleware;
