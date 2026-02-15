import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartModalProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartModal({ items, onClose, onUpdateQuantity, onRemoveItem, onCheckout }: CartModalProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.cashPrice * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-white">Shopping Cart ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <p className="text-[#666666] mb-4">Your cart is empty</p>
              <button
                onClick={onClose}
                className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-[#F0F4F8] rounded-lg p-4 flex gap-4">
                  <img
                    src={item.product.images?.[0] || item.product.imageUrl || ''}
                    alt={item.product.name}
                    className="w-24 h-24 object-contain bg-white rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-[#1A1A1A] mb-2">{item.product.name}</h3>
                    <p className="text-[#003366] mb-2">
                      {item.product.cashPrice.toLocaleString()} EGP
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="bg-white hover:bg-[#F0F4F8] p-2 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 bg-white rounded">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="bg-white hover:bg-[#F0F4F8] p-2 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#FF4444] hover:bg-[#FF4444]/10 p-2 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <p className="text-[#003366]">
                      {(item.product.cashPrice * item.quantity).toLocaleString()} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#F0F4F8] p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal</span>
                <span className="text-[#1A1A1A]">{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Shipping</span>
                <span className="text-[#1A1A1A]">
                  {shipping === 0 ? (
                    <span className="text-[#00C851]">Free</span>
                  ) : (
                    `${shipping} EGP`
                  )}
                </span>
              </div>
              {subtotal < 5000 && subtotal > 0 && (
                <p className="text-[#FF6600] text-xs">
                  Add {(5000 - subtotal).toLocaleString()} EGP more for free shipping!
                </p>
              )}
              <div className="flex justify-between pt-2 border-t border-[#F0F4F8]">
                <span className="text-[#1A1A1A]">Total</span>
                <span className="text-[#003366]">{total.toLocaleString()} EGP</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white py-3 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
