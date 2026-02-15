import { useState } from 'react';
import { MapPin, CreditCard, Package, CheckCircle, Truck, Store, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { SMSOTPVerification } from './SMSOTPVerification';
import { ordersApi } from '../api/orders.api';

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: () => void;
  onBack: () => void;
}

export function CheckoutFlow({ items, onComplete, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fawry' | 'wallet' | 'installment'>('card');
  const [phoneNumber, setPhoneNumber] = useState('01012345678');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.product.cashPrice * item.quantity), 0);
  const shipping = deliveryMethod === 'delivery' ? (subtotal > 5000 ? 0 : 100) : 0;
  const total = subtotal + shipping;

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Confirmation', icon: Package },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back to Shopping Button */}
      <button
        onClick={onBack}
        className="mb-6 text-[#003366] hover:text-[#FF6600] transition-colors flex items-center gap-2"
      >
        <span>←</span> Back to Shopping
      </button>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${step >= s.number
                      ? 'bg-[#003366] text-white'
                      : 'bg-[#F0F4F8] text-[#666666]'
                      }`}
                  >
                    {step > s.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={step >= s.number ? 'text-[#003366]' : 'text-[#666666]'}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 ${step > s.number ? 'bg-[#003366]' : 'bg-[#F0F4F8]'
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column - Form */}
        <div className="md:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-[#003366] mb-6">Shipping Information</h2>

              {/* Delivery Method */}
              <div className="mb-6">
                <label className="block text-[#1A1A1A] mb-3">Delivery Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryMethod === 'delivery'
                      ? 'border-[#003366] bg-[#003366]/5'
                      : 'border-[#F0F4F8] hover:border-[#003366]'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="w-6 h-6 text-[#003366]" />
                      <h3 className="text-[#1A1A1A]">Home Delivery</h3>
                    </div>
                    <p className="text-[#666666] text-xs">3-5 business days</p>
                  </div>
                  <div
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${deliveryMethod === 'pickup'
                      ? 'border-[#003366] bg-[#003366]/5'
                      : 'border-[#F0F4F8] hover:border-[#003366]'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Store className="w-6 h-6 text-[#003366]" />
                      <h3 className="text-[#1A1A1A]">Store Pickup</h3>
                    </div>
                    <p className="text-[#666666] text-xs">Free - Ready today</p>
                  </div>
                </div>
              </div>

              {deliveryMethod === 'delivery' ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#1A1A1A] mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#1A1A1A] mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                    />
                    <p className="text-[#666666] text-xs mt-1">
                      Egyptian mobile number (11 digits)
                    </p>
                  </div>
                  <div>
                    <label className="block text-[#1A1A1A] mb-2">Governorate</label>
                    <select className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]">
                      <option>Select Governorate</option>
                      <option>Cairo</option>
                      <option>Giza</option>
                      <option>Alexandria</option>
                      <option>Dakahlia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#1A1A1A] mb-2">Address</label>
                    <textarea
                      className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                      rows={3}
                      placeholder="Street, Building, Floor, Apartment"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#F0F4F8] rounded-lg p-4">
                  <p className="text-[#1A1A1A] mb-2">Select a store location:</p>
                  <select className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366] bg-white">
                    <option>Cairo - Nasr City Branch</option>
                    <option>Giza - 6th October Branch</option>
                    <option>Alexandria - City Center Branch</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white py-3 rounded-lg mt-6 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-[#003366] mb-6">Payment Method</h2>

              <div className="space-y-4 mb-6">
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'card'
                    ? 'border-[#003366] bg-[#003366]/5'
                    : 'border-[#F0F4F8]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#003366]" />
                    <div>
                      <h3 className="text-[#1A1A1A]">Credit / Debit Card</h3>
                      <p className="text-[#666666] text-xs">Visa, Mastercard</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('installment')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'installment'
                    ? 'border-[#003366] bg-[#003366]/5'
                    : 'border-[#F0F4F8]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#FF6600]" />
                    <div>
                      <h3 className="text-[#1A1A1A]">Installment Plan</h3>
                      <p className="text-[#FF6600] text-xs">0% Interest Available</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('fawry')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'fawry'
                    ? 'border-[#003366] bg-[#003366]/5'
                    : 'border-[#F0F4F8]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-[#003366]" />
                    <div>
                      <h3 className="text-[#1A1A1A]">FawryPay</h3>
                      <p className="text-[#666666] text-xs">Pay at Fawry outlets</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'wallet'
                    ? 'border-[#003366] bg-[#003366]/5'
                    : 'border-[#F0F4F8]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#003366]" />
                    <div>
                      <h3 className="text-[#1A1A1A]">Digital Wallet</h3>
                      <p className="text-[#666666] text-xs">Vodafone Cash, Instapay</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[#1A1A1A] mb-2">Card Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#1A1A1A] mb-2">Expiry Date</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] mb-2">CVV</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366]"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'installment' && (
                <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFE8CC] border border-[#FF6600]/30 rounded-lg p-4 mb-6">
                  <p className="text-[#1A1A1A] mb-2">
                    Pay only the down payment now, sign installment contract upon delivery
                  </p>
                  <p className="text-[#FF6600]">Monthly: ~{Math.round(total / 24).toLocaleString()} EGP × 24 months</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border-2 border-[#003366] text-[#003366] py-3 rounded-lg hover:bg-[#F0F4F8] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    if (paymentMethod === 'installment') {
                      setShowOTPVerification(true);
                    } else {
                      // Create order via API
                      setIsSubmittingOrder(true);
                      setOrderError(null);
                      try {
                        const orderData = {
                          items: items.map(item => ({
                            productId: item.product.id,
                            quantity: item.quantity,
                          })),
                          deliveryMethod,
                          paymentMethod: paymentMethod as 'cash' | 'card' | 'installment',
                        };

                        const response = await ordersApi.createOrder(orderData);
                        setOrderId(response.data.id);
                        setStep(3);
                      } catch (error: any) {
                        console.error('Order creation failed:', error);
                        setOrderError(
                          error.response?.data?.message ||
                          'Failed to create order. Please try again.'
                        );
                      } finally {
                        setIsSubmittingOrder(false);
                      }
                    }
                  }}
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingOrder && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSubmittingOrder
                    ? 'Processing...'
                    : paymentMethod === 'installment'
                      ? 'Verify Contract'
                      : 'Review Order'}
                </button>
              </div>

              {/* Order Error */}
              {orderError && (
                <div className="mt-4 bg-[#FF4444]/10 border border-[#FF4444] text-[#FF4444] rounded-lg p-3">
                  <p className="text-sm">{orderError}</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#00C851] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-[#003366] mb-2">Order Confirmed!</h2>
                <p className="text-[#666666]">Your order has been placed successfully</p>
              </div>

              <div className="bg-[#F0F4F8] rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#666666] mb-1">Order Number</p>
                    <p className="text-[#003366]">#{orderId || `ORD-${Math.floor(Math.random() * 100000)}`}</p>
                  </div>
                  <div>
                    <p className="text-[#666666] mb-1">Estimated Delivery</p>
                    <p className="text-[#003366]">3-5 business days</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white py-3 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Right column - Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h3 className="text-[#003366] mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.imageUrlUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain bg-[#F0F4F8] rounded"
                  />
                  <div className="flex-1">
                    <p className="text-[#1A1A1A] text-sm line-clamp-2">{item.product.name}</p>
                    <p className="text-[#666666] text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-[#003366] text-sm">{item.product.cashPrice.toLocaleString()} EGP</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#F0F4F8] pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal</span>
                <span className="text-[#1A1A1A]">{subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Shipping</span>
                <span className="text-[#1A1A1A]">
                  {shipping === 0 ? <span className="text-[#00C851]">Free</span> : `${shipping} EGP`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F0F4F8]">
                <span className="text-[#003366]">Total</span>
                <span className="text-[#003366]">{total.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal for Installment */}
      {showOTPVerification && paymentMethod === 'installment' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <SMSOTPVerification
            phoneNumber={phoneNumber}
            onVerify={(otp) => {
              console.log('OTP Verified:', otp);
              setShowOTPVerification(false);
              setStep(3);
            }}
            onBack={() => setShowOTPVerification(false)}
            contractDetails={{
              totalAmount: total,
              monthlyPayment: Math.round(total / 24),
              duration: 24,
            }}
          />
        </div>
      )}
    </div>
  );
}
