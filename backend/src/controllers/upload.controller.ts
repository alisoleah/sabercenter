import { Request, Response, NextFunction } from 'express';
import storageService from '../services/storage.service';

export class UploadController {
    /**
     * Upload Image (Public)
     * Used for product images, banners, etc.
     */
    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }

            // Explicitly set isPublic = true
            const url = await storageService.uploadFile(req.file, 'images', true);

            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: { url },
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Delete Image
     * Optional: Implement if needed to clean up S3
     */
    async deleteImage(req: Request, res: Response, next: NextFunction) {
        // TODO: Implement deletion logic in StorageService first
        res.status(501).json({ message: 'Not implemented' });
    }
}

export default new UploadController();
