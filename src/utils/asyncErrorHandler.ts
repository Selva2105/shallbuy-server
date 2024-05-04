import type { NextFunction, Request, RequestHandler, Response } from 'express';

export default (fun: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.resolve(fun(req, res, next));
    } catch (err) {
      next(err);
    }
  };
};
