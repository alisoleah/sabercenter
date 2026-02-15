import { X, Check } from 'lucide-react';
import { Product } from '../types';
import { calculateInstallment } from '../utils/installmentCalculator';

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
}

export function ProductComparison({
  products,
  onClose,
  onRemoveProduct,
}: ProductComparisonProps) {
  const installmentDurations = [6, 12, 18, 24];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-white">Product Comparison</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FF6600] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#666666] mb-4">
              No products selected for comparison
            </p>
            <p className="text-[#666666] text-sm">
              Select 2-3 products to compare their features and installment plans
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F0F4F8]">
                  <th className="px-4 py-3 text-left text-[#003366] sticky left-0 bg-[#F0F4F8]">
                    Feature
                  </th>
                  {products.map((product) => (
                    <th
                      key={product.id}
                      className="px-4 py-3 text-center min-w-[280px]"
                    >
                      <div className="relative">
                        <button
                          onClick={() => onRemoveProduct(product.id)}
                          className="absolute -top-2 -right-2 bg-[#FF4444] text-white rounded-full p-1 hover:bg-[#FF6600] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-32 h-32 object-contain mx-auto mb-2"
                        />
                        <p className="text-[#1A1A1A] text-sm font-normal line-clamp-2">
                          {product.name}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Brand */}
                <tr className="border-t border-[#F0F4F8]">
                  <td className="px-4 py-3 text-[#003366] font-medium sticky left-0 bg-white">
                    Brand
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className="px-4 py-3 text-center text-[#1A1A1A]"
                    >
                      {product.brand}
                    </td>
                  ))}
                </tr>

                {/* Cash Price */}
                <tr className="border-t border-[#F0F4F8] bg-[#FFF9F5]">
                  <td className="px-4 py-3 text-[#003366] font-medium sticky left-0 bg-[#FFF9F5]">
                    Cash Price
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className="px-4 py-3 text-center text-[#003366] font-bold"
                    >
                      {product.cashPrice.toLocaleString()} EGP
                      {product.oldPrice && (
                        <p className="text-[#666666] text-sm line-through mt-1">
                          {product.oldPrice.toLocaleString()} EGP
                        </p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr className="border-t border-[#F0F4F8]">
                  <td className="px-4 py-3 text-[#003366] font-medium sticky left-0 bg-white">
                    Warranty
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className="px-4 py-3 text-center text-[#1A1A1A]"
                    >
                      {product.warranty || 'Standard'}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-t border-[#F0F4F8]">
                  <td className="px-4 py-3 text-[#003366] font-medium sticky left-0 bg-white">
                    Rating
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className="px-4 py-3 text-center text-[#1A1A1A]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[#FF6600]">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </span>
                        <span className="text-[#666666] text-sm">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stock Status */}
                <tr className="border-t border-[#F0F4F8]">
                  <td className="px-4 py-3 text-[#003366] font-medium sticky left-0 bg-white">
                    Availability
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-4 py-3 text-center">
                      {product.stockQty > 0 ? (
                        <span className="text-[#00C851] flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> In Stock
                        </span>
                      ) : (
                        <span className="text-[#FF4444]">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Installment Plans Header */}
                <tr className="border-t border-[#F0F4F8] bg-[#003366]">
                  <td
                    colSpan={products.length + 1}
                    className="px-4 py-3 text-white font-medium text-center"
                  >
                    Installment Plans (0% Interest)
                  </td>
                </tr>

                {/* Installment Options */}
                {installmentDurations.map((months) => (
                  <tr
                    key={months}
                    className="border-t border-[#F0F4F8] bg-gradient-to-r from-[#FFF9F5] to-white"
                  >
                    <td className="px-4 py-3 text-[#FF6600] font-medium sticky left-0 bg-[#FFF9F5]">
                      {months} Months
                    </td>
                    {products.map((product) => {
                      const installment = calculateInstallment(
                        product.cashPrice,
                        0,
                        months,
                        0
                      );
                      return (
                        <td
                          key={product.id}
                          className="px-4 py-3 text-center text-[#1A1A1A]"
                        >
                          <p className="font-bold text-[#FF6600]">
                            {installment.monthlyPayment.toLocaleString()} EGP/mo
                          </p>
                          <p className="text-[#666666] text-xs mt-1">
                            Total: {installment.totalAmount.toLocaleString()} EGP
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Specifications */}
                {products.some((p) => p.specs) && (
                  <>
                    <tr className="border-t border-[#F0F4F8] bg-[#F0F4F8]">
                      <td
                        colSpan={products.length + 1}
                        className="px-4 py-3 text-[#003366] font-medium"
                      >
                        Specifications
                      </td>
                    </tr>
                    {/* Get all unique spec keys */}
                    {Array.from(
                      new Set(
                        products.flatMap((p) =>
                          p.specs ? Object.keys(p.specs) : []
                        )
                      )
                    ).map((specKey) => (
                      <tr key={specKey} className="border-t border-[#F0F4F8]">
                        <td className="px-4 py-3 text-[#003366] sticky left-0 bg-white">
                          {specKey}
                        </td>
                        {products.map((product) => (
                          <td
                            key={product.id}
                            className="px-4 py-3 text-center text-[#1A1A1A]"
                          >
                            {product.specs?.[specKey] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#F0F4F8] px-6 py-4 rounded-b-lg flex justify-between items-center">
          <p className="text-[#666666] text-sm">
            Comparing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="bg-[#003366] hover:bg-[#003366]/90 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
