import type { NextFunction, Request, Response } from 'express';

import type { ContactFormService } from '@/services/contact.service';

import asyncErrorHandler from '../utils/asyncErrorHandler';

export class ContactFormController {
  private contactFormService: ContactFormService;

  constructor(contactFormService: ContactFormService) {
    this.contactFormService = contactFormService;
  }

  public createContactForm = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const form = await this.contactFormService.createContactForm(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: form,
      });
    },
  );

  public getAllContactForms = asyncErrorHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const forms = await this.contactFormService.getAllContactForms();
      res.status(200).json({
        status: 'success',
        length: forms.length,
        message: 'All forms fetched successfully',
        data: forms,
      });
    },
  );
}
