import type {
  Job,
  JobGroup,
  JobType,
  Prisma,
  PrismaClient,
  Salary,
} from '@prisma/client';

export class JobRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createJob(jobData: Prisma.JobCreateInput): Promise<Job> {
    return this.prisma.job.create({
      data: {
        ...jobData,
        jobGroup: jobData.jobGroup as JobGroup,
        location: jobData.location,
        salary: jobData.salary as Salary,
        jobType: jobData.jobType as JobType,
        createdBy: {
          connect: { id: jobData.createdBy as string },
        },
      },
    });
  }

  async getJobs(): Promise<Job[]> {
    return this.prisma.job.findMany();
  }
}
