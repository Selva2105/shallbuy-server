import type {
  Application,
  ApplicationStatus,
  PrismaClient,
} from '@prisma/client';

export class ApplicationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private static buildFilters(filterParams: any): any {
    const filters: any = {};
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== undefined) {
        filters[key] = value;
      }
    }
    return filters;
  }

  public async findApplicationById(id: string): Promise<Application | null> {
    return this.prisma.application.findUnique({
      where: { id },
    });
  }

  public async createApplication(data: any): Promise<Application> {
    return this.prisma.application.create({
      data,
    });
  }

  public async getApplications(query: any): Promise<Application[]> {
    const {
      yearOfGraduation,
      gender,
      experienceInYears,
      currentCTC,
      expectedCTC,
      noticePeriod,
      applicationStatus,
      createdById,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filters: any = ApplicationRepository.buildFilters({
      yearOfGraduation,
      gender,
      experienceInYears,
      currentCTC,
      expectedCTC,
      noticePeriod,
      applicationStatus,
    });

    return this.prisma.application.findMany({
      where: {
        ...filters,
        job: createdById ? { createdById } : undefined,
      },
      include: {
        job: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  public async updateApplicationStatus(
    id: string,
    status: string,
  ): Promise<Application> {
    return this.prisma.application.update({
      where: { id },
      data: { applicationStatus: status as ApplicationStatus },
    });
  }
}
