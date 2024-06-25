import type { NextFunction, Request, Response } from 'express';

import type { JobService } from '@/services/careers.service';
import asyncErrorHandler from '@/utils/asyncErrorHandler';

export class CareersController {
  private jobService: JobService;

  constructor(jobService: JobService) {
    this.jobService = jobService;
  }

  public createJob = asyncErrorHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const job = await this.jobService.createJob(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Job created successfully',
        job,
      });
    },
  );

  public getJobs = asyncErrorHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const jobs = await this.jobService.getJobs();
      const groupNames = [...new Set(jobs.jobs.map((job) => job.jobGroup))];

      res.status(200).json({
        status: 'success',
        length: jobs.jobs.length,
        uniqueGroupNames: groupNames,
        message: 'Jobs fetched successfully',
        jobs: jobs.jobs,
      });
    },
  );
}
