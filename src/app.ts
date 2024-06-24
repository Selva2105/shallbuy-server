import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';

import globalErrorHandler from './middleware/globalErrorHandler';
import authRouter from './router/auth.router';
import CommentRouter from './router/comment.router';
import contactRouter from './router/contact.router';
import productRouter from './router/product.router';
import CustomError from './utils/customError';

export const prisma = new PrismaClient();

// prisma.$use(async (params, next) => {
//   if (params.model === 'User') {
//     if (params.action === 'findMany' || params.action === 'findUnique') {
//       params.args.include = { ...params.args.include, addresses: true };
//     }
//   }
//   return next(params);
// });

dotenv.config();

export const app: Express = express();
const port = process.env.PORT || 3000;

/**
 * Main function to configure and start the Express server.
 */
async function main() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms'),
  );

  app.get('/', (_req, res) => {
    res.send('⚡️ Healthy server running!');
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/comments', CommentRouter);
  app.use('/api/v1/contact', contactRouter);
  // 404 route - Handles requests to undefined routes
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    const err = new CustomError(
      `Can't find ${req.originalUrl} on the server`,
      404,
    );
    next(err);
  });

  // Global error handler middleware - Handles errors throughout the application
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
