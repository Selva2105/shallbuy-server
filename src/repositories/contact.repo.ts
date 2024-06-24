import type { ContactForm, PrismaClient } from '@prisma/client';

export class ContactFormRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createContactForm(data: Omit<ContactForm, 'id'>): Promise<ContactForm> {
    return this.prisma.contactForm.create({ data });
  }

  async getAllContactForms(): Promise<ContactForm[]> {
    return this.prisma.contactForm.findMany();
  }
}
