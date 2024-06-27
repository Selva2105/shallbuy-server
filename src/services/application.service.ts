import type { Request } from 'express';
import type { FirebaseApp } from 'firebase/app';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import type { ApplicationRepository } from '@/repositories/application.repo';
import CustomError from '@/utils/customError';
import DateTimeUtils from '@/utils/dateUtils';

export class ApplicationService {
  private applicationRepository: ApplicationRepository;

  private storage: ReturnType<typeof getStorage>;

  constructor(
    applicationRepository: ApplicationRepository,
    firebaseApp: FirebaseApp,
  ) {
    this.applicationRepository = applicationRepository;
    this.storage = getStorage(firebaseApp);
  }

  public async createApplication(req: Request) {
    const { file } = req;
    if (!file) {
      throw new CustomError('No file uploaded', 400);
    }

    const dateTime = DateTimeUtils.giveCurrentDateTime();
    const storageRef = ref(
      this.storage,
      `pdfs/${`${file.originalname} ${dateTime}`}`,
    );
    const metadata = { contentType: file.mimetype };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );
    const pdfUrl = await getDownloadURL(snapshot.ref);

    const applicationData = {
      ...req.body,
      pdfUrl,
      applicationStatus: 'Applied',
    };

    return this.applicationRepository.createApplication(applicationData);
  }

  public async getApplications(query: any) {
    return this.applicationRepository.getApplications(query);
  }

  public async updateApplicationStatus(id: string, status: string) {
    const application =
      await this.applicationRepository.findApplicationById(id);
    if (!application) {
      throw new CustomError('Application not found', 404);
    }
    return this.applicationRepository.updateApplicationStatus(id, status);
  }
}
