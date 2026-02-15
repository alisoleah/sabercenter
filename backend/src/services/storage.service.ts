import fs from 'fs';
import path from 'path';
import config from '../config/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Ensure uploads directory exists for local storage
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class StorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      this.s3Client = new S3Client({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
    }
  }

  /**
   * Upload file (Switch between Local and S3 based on config)
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'documents', isPublic: boolean = false): Promise<string> {
    if (this.s3Client && config.aws.s3BucketName) {
      return this.uploadToS3(file, folder, isPublic);
    } else {
      return this.uploadToLocal(file, folder);
    }
  }

  /**
   * Upload to Local Storage
   */
  private async uploadToLocal(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const folderPath = path.join(UPLOADS_DIR, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    // Return relative URL
    return `/uploads/${folder}/${fileName}`;
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(file: Express.Multer.File, folder: string, isPublic: boolean): Promise<string> {
    if (!this.s3Client) throw new Error('S3 Client not initialized');

    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: config.aws.s3BucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: isPublic ? 'public-read' : 'private',
      ServerSideEncryption: isPublic ? undefined : 'AES256',
    });

    await this.s3Client.send(command);

    // For public files, return the full public URL
    if (isPublic) {
      return `https://${config.aws.s3BucketName}.s3.${config.aws.region}.amazonaws.com/${fileName}`;
    }

    // For private files, return the Key (to be used with signed URLs)
    return fileName;
  }

  /**
   * Generate Signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.s3Client && config.aws.s3BucketName) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.aws.s3BucketName,
          Key: key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
      } catch (error) {
        console.error('Error generating signed URL:', error);
        return key; // Fallback or throw
      }
    }

    // For local storage, just return the path
    if (key.startsWith('/uploads/')) return key;
    return `/uploads/${key}`;
  }
}

export default new StorageService();
