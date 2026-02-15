import { Router } from 'express';
import productsController from '../controllers/products.controller';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/products.validator';
import { uuidParamSchema } from '../validators/common.validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for product image uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/products');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

/**
 * GET /api/products
 * List products with filters and pagination
 */
router.get('/', optionalAuth, validate(productQuerySchema), productsController.getProducts);

/**
 * GET /api/products/featured
 * Get featured products
 */
router.get('/featured', optionalAuth, productsController.getFeaturedProducts);

/**
 * GET /api/products/search
 * Search products by query
 */
router.get('/search', optionalAuth, productsController.searchProducts);

/**
 * GET /api/products/budget/:monthlyBudget
 * Get products by monthly installment budget
 */
router.get('/budget/:monthlyBudget', optionalAuth, productsController.getProductsByBudget);

/**
 * GET /api/products/categories
 * List all categories
 */
router.get('/categories', optionalAuth, productsController.getCategories);

/**
 * GET /api/products/categories/:id
 * Get category with products
 */
router.get('/categories/:id', optionalAuth, productsController.getCategoryById);

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', optionalAuth, validate(uuidParamSchema), productsController.getProductById);

// Admin routes (Protected)
// Note: validate() middleware might fail if body is multipart/form-data because express-validator expects parsed body.
// However, multer runs first, populates req.body (text fields) and req.files.
// So validation SHOULD work if fields are sent correctly.
router.post('/', authenticate, requireRole('admin'), upload.array('images', 10), validate(createProductSchema), productsController.createProduct);
router.put('/:id', authenticate, requireRole('admin'), upload.array('images', 10), validate(updateProductSchema), productsController.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), validate(uuidParamSchema), productsController.deleteProduct);

export default router;
