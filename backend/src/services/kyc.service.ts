import prisma from '../config/database';
import storageService from './storage.service';
import { encrypt } from '../utils/encryption';

interface KycData {
  userId: string;
  nationalId: string;
  monthlySalary: number;
  employer: string;
  address?: string;
  scannedIdUrl?: string; // Optional if uploaded separately, but needed for approval
  utilityBillUrl?: string;
}

export class KycService {
  /**
   * Upload KYC Document
   */
  async uploadDocument(userId: string, file: Express.Multer.File, type: 'id' | 'bill') {
    // 1. Upload file (Private by default)
    const key = await storageService.uploadFile(file, 'kyc', false);

    // 2. Update Profile (create if not exists)
    // We update the specific field based on type
    const data: any = {};
    if (type === 'id') data.scannedIdUrl = key;
    if (type === 'bill') data.utilityBillUrl = key;

    await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        nationalId: '', // Placeholder, must be filled in submit
        monthlySalary: 0, // Placeholder
        employer: '', // Placeholder
        ...data
      },
    });

    // Return signed URL for immediate preview
    return await storageService.getSignedUrl(key);
  }

  /**
   * Submit KYC Application
   */
  async submitApplication(data: KycData) {
    // Check if user already has a pending or approved application
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      if (existingProfile.kycStatus === 'Approved') {
        throw new Error('KYC already approved');
      }
      if (existingProfile.kycStatus === 'Pending' && existingProfile.nationalId) {
        // If nationalId is set, it means they already submitted.
        // We might allow re-submission if it was just a draft, but typically we block duplicates.
        // However, for this MVP, let's allow updating if it's Pending.
      }
    }

    // Update Profile
    const profile = await prisma.profile.upsert({
      where: { userId: data.userId },
      update: {
        nationalId: encrypt(data.nationalId),
        monthlySalary: data.monthlySalary,
        employer: data.employer,
        address: data.address,
        kycStatus: 'Pending',
        kycSubmittedAt: new Date(),
      },
      create: {
        userId: data.userId,
        nationalId: encrypt(data.nationalId),
        monthlySalary: data.monthlySalary,
        employer: data.employer,
        address: data.address,
        kycStatus: 'Pending',
        kycSubmittedAt: new Date(),
      },
    });

    return profile;
  }

  /**
   * Get KYC Status
   */
  async getStatus(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        kycStatus: true,
        kycSubmittedAt: true,
        kycApprovedAt: true,
        rejectionReason: true,
        scannedIdUrl: true,
        utilityBillUrl: true,
      },
    });

    if (!profile) {
      return { kycStatus: 'Not Started' };
    }

    // Generate signed URLs for documents
    const response: any = { ...profile };

    if (profile.scannedIdUrl) {
      response.scannedIdUrl = await storageService.getSignedUrl(profile.scannedIdUrl);
    }

    if (profile.utilityBillUrl) {
      response.utilityBillUrl = await storageService.getSignedUrl(profile.utilityBillUrl);
    }

    return response;
  }
}

export default new KycService();
