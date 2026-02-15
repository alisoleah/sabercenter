import { Router } from 'express';
import multer from 'multer';
import uploadController from '../controllers/upload.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect routes - Admin only
router.use(authenticate, requireRole('admin'));

// Upload image (public)
router.post('/image', upload.single('file'), uploadController.uploadImage);

export default router;
