import type { Job } from '@prisma/client';

import type { UserRepository } from '@/repositories/auth.repo';
import type { JobRepository } from '@/repositories/careers.repo';
import CustomError from '@/utils/customError';

export class JobService {
  private JobRepository: JobRepository;

  private userRepository: UserRepository;

  constructor(JobRepo: JobRepository, userRepo: UserRepository) {
    this.JobRepository = JobRepo;
    this.userRepository = userRepo;
  }

  async createJob(jobData: any): Promise<Job> {
    const user = await this.userRepository.findById(jobData.createdBy);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return this.JobRepository.createJob(jobData);
  }

  async getJobs(): Promise<{ jobs: Job[]; groupNames: string[] }> {
    const jobs = await this.JobRepository.getJobs();
    const groupNames = [
      ...new Set(jobs.map((job: Job) => job.jobGroup as string)),
    ];
    return { jobs, groupNames };
  }
}
