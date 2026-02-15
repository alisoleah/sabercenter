import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { calculateInstallment } from '../utils/installmentCalculator';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const installment = calculateInstallment(product.cashPrice, 0, 24);

  // Image carousel state
  const productImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.imageUrl || ''];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => onClick?.(product)}
    >
      <div className="relative p-4">
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {Array.isArray(product.badges) && product.badges.map((badge, index) => (
            <span
              key={index}
              className="bg-[#FF6600] text-white px-2 py-1 rounded text-xs"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Wishlist button */}
        <button
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-[#F0F4F8] transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="w-4 h-4 text-[#666666]" />
        </button>

        {/* Product image with carousel */}
        <div className="aspect-square bg-white mb-4 relative">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={productImages[currentImageIndex]}
              alt={`${product.name} ${currentImageIndex + 1}`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Carousel navigation - only show if multiple images */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-r shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-5 h-5 text-[#003366]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-l shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-5 h-5 text-[#003366]" />
              </button>

              {/* Image dots indicator - ALWAYS VISIBLE */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {productImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all cursor-pointer ${idx === currentImageIndex
                      ? 'bg-[#FF6600] w-8 h-3'
                      : 'bg-white border-2 border-gray-400 w-3 h-3 hover:bg-gray-200'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Brand */}
        <p className="text-[#666666] mb-1">{product.brand}</p>

        {/* Title */}
        <h3 className="text-[#1A1A1A] mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#FF6600]">
                {i < Math.floor(product.rating || 0) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-[#666666]">({product.reviewCount || 0})</span>
        </div>

        {/* Price block */}
        <div className="mb-3">
          {product.oldPrice && (
            <p className="text-[#666666] line-through">
              {product.oldPrice.toLocaleString()} EGP
            </p>
          )}
          <p className="text-[#003366]">
            {(product.cashPrice || 0).toLocaleString()} EGP
          </p>
        </div>

        {/* Installment highlight */}
        <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFE8CC] border border-[#FF6600]/30 rounded-lg p-3 mb-3">
          <p className="text-[#FF6600]">
            Or {installment.monthlyPayment.toLocaleString()} EGP / 24 months
          </p>
          <p className="text-[#666666] text-xs mt-1">0% Interest</p>
        </div>

        {/* Stock status */}
        {product.stockQty > 0 ? (
          <p className="text-[#00C851] mb-3">In Stock</p>
        ) : (
          <p className="text-[#FF4444] mb-3">Out of Stock</p>
        )}

        {/* Add to cart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={product.stockQty <= 0}
          className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 disabled:bg-[#666666] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
