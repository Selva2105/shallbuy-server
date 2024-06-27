import { PrismaClient, Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import multer from 'multer';

import { firebaseConfig } from '@/config/firebaseConfig';
import { ApplicationController } from '@/controller/application.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import RestrictMiddleware from '@/middleware/restrict';
import { ApplicationRepository } from '@/repositories/application.repo';
import { ApplicationService } from '@/services/application.service';
import CustomError from '@/utils/customError';
import applicationValidators from '@/validators/application.validator';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('pdf');
const prisma = new PrismaClient();

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const applicationRepository = new ApplicationRepository(prisma);
const applicationService = new ApplicationService(
  applicationRepository,
  firebaseApp,
);
const applicationController = new ApplicationController(applicationService);

const restrictMiddleware = new RestrictMiddleware(Role.ADMIN, Role.TESTER);

router.post(
  '/',
  ProtectMiddleware.protect,
  upload,
  applicationValidators,
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
      applicationController.createApplication(req, res, next);
    }
  },
);

router.get(
  '/',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  (req: Request, res: Response, next: NextFunction) => {
    applicationController.getApplications(req, res, next);
  },
);

router.patch(
  '/:id/status',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  applicationController.updateApplicationStatus,
);

export default router;
