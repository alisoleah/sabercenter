import { Request, Response } from 'express';
import productsService from '../services/products.service';

export class ProductsController {
  /**
   * GET /api/products
   * List products with filters and pagination
   */
  async getProducts(req: Request, res: Response) {
    try {
      const {
        categoryId,
        brand,
        minPrice,
        maxPrice,
        search,
        inStock,
        page = '1',
        limit = '20',
      } = req.query;

      const filters = {
        categoryId: categoryId as string | undefined,
        brand: brand as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string | undefined,
        inStock: inStock === 'true',
      };

      const result = await productsService.getProducts(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get single product by ID
   */
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productsService.getProductById(id);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Product not found',
      });
    }
  }

  /**
   * GET /api/products/search
   * Search products by query
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const { q, limit = '10' } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const products = await productsService.searchProducts(
        q,
        parseInt(limit as string)
      );

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/products/budget/:monthlyBudget
   * Get products by monthly installment budget
   */
  async getProductsByBudget(req: Request, res: Response) {
    try {
      const { monthlyBudget } = req.params;
      const { duration = '24', limit = '20' } = req.query;

      const budget = parseFloat(monthlyBudget);
      if (isNaN(budget) || budget <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid monthly budget amount',
        });
      }

      const products = await productsService.getProductsByBudget(
        budget,
        parseInt(duration as string),
        parseInt(limit as string)
      );

      return res.status(200).json({
        success: true,
        data: {
          monthlyBudget: budget,
          durationMonths: parseInt(duration as string),
          maxProductPrice: budget * parseInt(duration as string),
          products,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products by budget',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/categories
   * List all categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productsService.getCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/categories/:id
   * Get category with products
   */
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await productsService.getCategoryById(id);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Category not found',
      });
    }
  }

  /**
   * GET /api/products/featured
   * Get featured products
   */
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const { limit = '8' } = req.query;

      const products = await productsService.getFeaturedProducts(
        parseInt(limit as string)
      );

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch featured products',
        error: error.message,
      });
    }
  }

  /**
   * Create a product (Admin only)
   */
  async createProduct(req: Request, res: Response) {
    try {
      // Handle image uploads
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const images = files.map(file => `/uploads/products/${file.filename}`);
        req.body.images = images;
        req.body.imageUrl = images[0]; // Set primary image
      }

      const product = await productsService.createProduct(req.body);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product',
      });
    }
  }

  /**
   * Update a product (Admin only)
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Handle image uploads
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const newImages = files.map(file => `/uploads/products/${file.filename}`);

        // Handle existing images (passed as JSON string or array)
        let existingImages = req.body.existingImages || [];
        if (typeof existingImages === 'string') {
          try {
            existingImages = JSON.parse(existingImages);
          } catch (e) {
            // If parse fails, assume it's a single URL string?
            // Or invalid. Best to treat as empty if invalid JSON but expected array.
            // However, if frontend sends "[]", it works.
            console.warn('Failed to parse existingImages:', e);
            existingImages = [];
          }
        }

        if (!Array.isArray(existingImages)) {
          existingImages = [];
        }

        const allImages = [...existingImages, ...newImages];
        req.body.images = allImages;
        if (allImages.length > 0) {
          req.body.imageUrl = allImages[0];
        }
      } else {
        // If no new files, existingImages might still be customized (reordered/deleted)
        // Check if existingImages is provided to update the list
        if (req.body.existingImages) {
          let existingImages = req.body.existingImages;
          if (typeof existingImages === 'string') {
            try { existingImages = JSON.parse(existingImages); } catch (e) { existingImages = []; }
          }
          if (Array.isArray(existingImages)) {
            req.body.images = existingImages;
            if (existingImages.length > 0) req.body.imageUrl = existingImages[0];
          }
        }
      }

      // Clean up request body (remove existingImages preventing Prisma error)
      delete req.body.existingImages;

      const product = await productsService.updateProduct(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await productsService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete product',
      });
    }
  }
}

export default new ProductsController();
