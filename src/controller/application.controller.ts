import type { NextFunction, Request, Response } from 'express';

import type { ApplicationService } from '@/services/application.service';
import asyncErrorHandler from '@/utils/asyncErrorHandler';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor(applicationService: ApplicationService) {
    this.applicationService = applicationService;
  }

  public createApplication = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const application = await this.applicationService.createApplication(req);
      res.status(201).json({
        status: 'success',
        message: 'Application created successfully',
        data: application,
      });
    },
  );

  public getApplications = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const applications = await this.applicationService.getApplications(
        req.query,
      );
      res.status(200).json({
        status: 'success',
        length: applications.length,
        data: applications,
      });
    },
  );

  public updateApplicationStatus = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { status } = req.body;
      const updatedApplication =
        await this.applicationService.updateApplicationStatus(id || '', status);
      res.status(200).json({
        status: 'success',
        message: 'Application status updated successfully',
        data: updatedApplication,
      });
    },
  );
}
