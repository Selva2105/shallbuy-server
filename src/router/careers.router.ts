import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';

import { firebaseConfig } from '@/config/firebaseConfig';
import { CareersController } from '@/controller/careers.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import RestrictMiddleware from '@/middleware/restrict';
import { UserRepository } from '@/repositories/auth.repo';
import { JobRepository } from '@/repositories/careers.repo';
import { JobService } from '@/services/careers.service';
import CustomError from '@/utils/customError';
import careersValidator from '@/validators/careers.validators';

const router = Router();
const prisma = new PrismaClient();
const jobRepository = new JobRepository(prisma);
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const userRepository = new UserRepository(prisma, firebaseApp);
const careersService = new JobService(jobRepository, userRepository);
const careersController = new CareersController(careersService);
const restrictMiddleware = new RestrictMiddleware('ADMIN', 'DEV');

router.post(
  '/',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  careersValidator,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors
        .array()
        .map((err: any) => ({ field: err.path, message: err.msg }));
      const customError = new CustomError(
        'Validation error',
        400,
        validationErrors,
      );
      next(customError);
    } else {
      careersController.createJob(req, res, next);
    }
  },
);

router.get('/', careersController.getJobs);

export default router;
