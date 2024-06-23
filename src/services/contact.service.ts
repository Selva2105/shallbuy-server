import type { ContactForm } from '@prisma/client';

import type { ContactFormRepository } from '@/repositories/contact.repo';

export class ContactFormService {
  private contactFormRepo: ContactFormRepository;

  constructor(contactFormRepo: ContactFormRepository) {
    this.contactFormRepo = contactFormRepo;
  }

  async createContactForm(data: Omit<ContactForm, 'id'>): Promise<ContactForm> {
    return this.contactFormRepo.createContactForm(data);
  }

  async getAllContactForms(): Promise<ContactForm[]> {
    return this.contactFormRepo.getAllContactForms();
  }
}
