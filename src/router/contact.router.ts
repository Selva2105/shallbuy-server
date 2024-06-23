import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { validationResult } from 'express-validator';

import { ContactFormController } from '@/controller/contact.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import RestrictMiddleware from '@/middleware/restrict';
import { ContactFormRepository } from '@/repositories/contact.repo';
import { ContactFormService } from '@/services/contact.service';
import CustomError from '@/utils/customError';
import conatctFormValidators from '@/validators/contact.validators';

const router = Router();
const prisma = new PrismaClient();

const contactFormRepo = new ContactFormRepository(prisma);
const contactService = new ContactFormService(contactFormRepo);
const contactFormController = new ContactFormController(contactService);
const restrictMiddleware = new RestrictMiddleware('admin', 'editor', 'viewer');

router.post(
  '/',
  conatctFormValidators.validateFormFields,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors
        .array()
        .map((err: any) => `${err.msg} (${err.param}: ${err.value})`)
        .join(', ');
      const customError = new CustomError(
        `Validation error: ${validationErrors}`,
        400,
      );
      next(customError);
    } else {
      contactFormController.createContactForm(req, res, next);
    }
  },
);

router.get(
  '/',
  ProtectMiddleware.protect,
  restrictMiddleware.restrict,
  contactFormController.getAllContactForms,
);

export default router;
