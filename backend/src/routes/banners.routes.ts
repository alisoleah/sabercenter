import { Router } from 'express';
import { bannersService } from '../services/banners.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Middleware for admin-only routes
const adminOnly = requireRole('admin');

// Configure multer for banner image uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/banners');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `banner-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
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

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/banners
 * Get active banners for homepage carousel
 */
router.get('/', async (req, res) => {
    try {
        const banners = await bannersService.getActiveBanners();
        res.json({ success: true, data: banners });
    } catch (error: any) {
        console.error('Get active banners error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch banners' });
    }
});

// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

/**
 * GET /api/banners/admin
 * Get all banners (admin only)
 */
router.get('/admin', authenticate, adminOnly, async (req, res) => {
    try {
        const banners = await bannersService.getAllBanners();
        res.json({ success: true, data: banners });
    } catch (error: any) {
        console.error('Get all banners error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch banners' });
    }
});

/**
 * POST /api/banners
 * Create new banner with image upload
 */
router.post('/', authenticate, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, ctaText, ctaLink, bgGradient, isActive, sortOrder, startDate, endDate } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Banner image is required' });
        }

        const imageUrl = `/uploads/banners/${req.file.filename}`;

        const banner = await bannersService.createBanner({
            title,
            subtitle,
            ctaText,
            ctaLink: ctaLink || undefined,
            imageUrl,
            bgGradient: bgGradient || undefined,
            isActive: isActive === 'true' || isActive === true,
            sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        res.status(201).json({ success: true, data: banner });
    } catch (error: any) {
        console.error('Create banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to create banner' });
    }
});

/**
 * PUT /api/banners/:id
 * Update existing banner
 */
router.put('/:id', authenticate, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, ctaText, ctaLink, bgGradient, isActive, sortOrder, startDate, endDate } = req.body;

        const updateData: any = {};
        if (title) updateData.title = title;
        if (subtitle) updateData.subtitle = subtitle;
        if (ctaText) updateData.ctaText = ctaText;
        if (ctaLink !== undefined) updateData.ctaLink = ctaLink || null;
        if (bgGradient) updateData.bgGradient = bgGradient;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
        if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);

        // If new image uploaded, update imageUrl
        if (req.file) {
            updateData.imageUrl = `/uploads/banners/${req.file.filename}`;

            // TODO: Delete old image file
        }

        const banner = await bannersService.updateBanner(id, updateData);
        res.json({ success: true, data: banner });
    } catch (error: any) {
        console.error('Update banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to update banner' });
    }
});

/**
 * DELETE /api/banners/:id
 * Delete banner
 */
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // TODO: Delete associated image file
        await bannersService.deleteBanner(id);

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error: any) {
        console.error('Delete banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete banner' });
    }
});

/**
 * PUT /api/banners/reorder
 * Update banner sort orders (drag-and-drop)
 */
router.put('/reorder', authenticate, adminOnly, async (req, res) => {
    try {
        const { bannerOrders } = req.body; // Array of { id, sortOrder }

        await bannersService.updateBannerOrders(bannerOrders);

        res.json({ success: true, message: 'Banner order updated successfully' });
    } catch (error: any) {
        console.error('Reorder banners error:', error);
        res.status(500).json({ success: false, message: 'Failed to reorder banners' });
    }
});

export default router;
