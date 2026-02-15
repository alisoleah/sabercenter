import { X, ShoppingCart, Truck, Store, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { InstallmentCalculator } from './InstallmentCalculator';
import { useState } from 'react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all product images
  const productImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.imageUrl || ''];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F0F4F8] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F0F4F8] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[#003366]">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F0F4F8] rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column - Image Carousel */}
            <div>
              <div className="bg-white rounded-lg p-8 mb-4 relative group">
                <img
                  src={productImages[currentImageIndex]}
                  alt={`${product.name} ${currentImageIndex + 1}`}
                  className="w-full h-auto object-contain"
                />

                {/* Carousel navigation - only show if multiple images */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#003366]" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight className="w-6 h-6 text-[#003366]" />
                    </button>

                    {/* Image dots indicator - LARGE AND VISIBLE */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {productImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`rounded-full transition-all cursor-pointer ${idx === currentImageIndex
                            ? 'bg-[#FF6600] w-10 h-4'
                            : 'bg-white border-2 border-gray-500 w-4 h-4 hover:bg-gray-200'
                            }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.badges?.map((badge, index) => (
                  <span
                    key={index}
                    className="bg-[#FF6600] text-white px-3 py-1 rounded"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Service features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[#003366]" />
                  <div>
                    <p className="text-[#1A1A1A]">Free Delivery</p>
                    <p className="text-[#666666] text-xs">Within 3-5 days</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Store className="w-6 h-6 text-[#003366]" />
                  <div>
                    <p className="text-[#1A1A1A]">Store Pickup</p>
                    <p className="text-[#666666] text-xs">Available</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#00C851]" />
                  <div>
                    <p className="text-[#1A1A1A]">Warranty</p>
                    <p className="text-[#666666] text-xs">{product.warranty}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                  <Star className="w-6 h-6 text-[#FF6600]" />
                  <div>
                    <p className="text-[#1A1A1A]">Rating</p>
                    <p className="text-[#666666] text-xs">{product.rating} / 5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Details */}
            <div className="space-y-6">
              {/* Product info */}
              <div className="bg-white rounded-lg p-6">
                <p className="text-[#666666] mb-2">{product.brand}</p>
                <h1 className="text-[#1A1A1A] mb-4">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#FF6600] text-xl">
                        {i < Math.floor(product.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-[#666666]">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {product.oldPrice && (
                    <p className="text-[#666666] line-through">
                      {product.oldPrice.toLocaleString()} EGP
                    </p>
                  )}
                  <p className="text-[#003366]">
                    {product.cashPrice.toLocaleString()} EGP
                  </p>
                  {product.oldPrice && (
                    <p className="text-[#00C851]">
                      Save {((product.oldPrice - product.cashPrice) / product.oldPrice * 100).toFixed(0)}%
                    </p>
                  )}
                </div>

                {/* Stock status */}
                {product.stockQty > 0 ? (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-[#00C851] rounded-full"></div>
                    <span className="text-[#00C851]">In Stock</span>
                    {product.lowStock && (
                      <span className="text-[#FF4444]">(Only few left!)</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-[#FF4444] rounded-full"></div>
                    <span className="text-[#FF4444]">Out of Stock</span>
                  </div>
                )}

                {/* Add to cart button */}
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={!product.stockQty > 0}
                  className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 disabled:bg-[#666666] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Technical specs */}
              {product.specs && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-[#003366] mb-4">Technical Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-[#F0F4F8] last:border-0">
                        <span className="text-[#666666]">{key}</span>
                        <span className="text-[#1A1A1A]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Installment Calculator */}
              <InstallmentCalculator productPrice={product.cashPrice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
