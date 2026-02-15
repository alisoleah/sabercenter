import { Router } from 'express';
import multer from 'multer';
import kycController from '../controllers/kyc.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { kycSubmitSchema, kycUploadSchema } from '../validators/kyc.validator';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all KYC routes
router.use(authenticate);

// Upload document
// Note: Multer middleware must run BEFORE validation if we were validating file existence in body, 
// but here file is handled separately. We can validate 'type' in body though.
router.post('/upload-document', upload.single('file'), validate(kycUploadSchema), kycController.uploadDocument);

// Submit Application
router.post('/submit', validate(kycSubmitSchema), kycController.submitKyc);

// Get Status
router.get('/status', kycController.getStatus);

export default router;
