import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculateInstallment } from '../utils/installmentCalculator';

interface InstallmentCalculatorProps {
  productPrice: number;
}

export function InstallmentCalculator({ productPrice }: InstallmentCalculatorProps) {
  const [downPayment, setDownPayment] = useState(0);
  const [duration, setDuration] = useState(24);

  const durations = [6, 12, 18, 24, 36];
  const installment = calculateInstallment(productPrice, downPayment, duration);
  const maxDownPayment = productPrice * 0.8; // Max 80% down payment

  const handleDownPaymentChange = (value: number) => {
    setDownPayment(Math.min(Math.max(0, value), maxDownPayment));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-[#003366]">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-6 h-6 text-[#003366]" />
        <h3 className="text-[#003366]">Installment Calculator</h3>
      </div>

      <div className="space-y-6">
        {/* Down Payment Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#1A1A1A]">Down Payment</label>
            <span className="text-[#003366]">
              {downPayment.toLocaleString()} EGP
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={maxDownPayment}
            step="100"
            value={downPayment}
            onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
            className="w-full h-2 bg-[#F0F4F8] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF6600 0%, #FF6600 ${(downPayment / maxDownPayment) * 100}%, #F0F4F8 ${(downPayment / maxDownPayment) * 100}%, #F0F4F8 100%)`
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[#666666] text-xs">0 EGP</span>
            <span className="text-[#666666] text-xs">{maxDownPayment.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="text-[#1A1A1A] block mb-2">Select Duration</label>
          <div className="grid grid-cols-5 gap-2">
            {durations.map((months) => (
              <button
                key={months}
                onClick={() => setDuration(months)}
                className={`py-2 rounded-lg border-2 transition-all ${
                  duration === months
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#1A1A1A] border-[#F0F4F8] hover:border-[#003366]'
                }`}
              >
                {months}m
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-[#003366] to-[#004488] rounded-lg p-6 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 mb-1">Monthly Payment</p>
              <p className="text-[#FF6600]">
                {installment.monthlyPayment.toLocaleString()} EGP
              </p>
            </div>
            <div>
              <p className="text-white/70 mb-1">Total Amount</p>
              <p>
                {installment.totalAmount.toLocaleString()} EGP
              </p>
            </div>
            <div>
              <p className="text-white/70 mb-1">Duration</p>
              <p>{duration} Months</p>
            </div>
            <div>
              <p className="text-white/70 mb-1">Interest Rate</p>
              <p className="text-[#00C851]">{installment.interestRate}%</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#FFF4E6] border border-[#FF6600]/30 rounded-lg p-4">
          <p className="text-[#1A1A1A] mb-2">
            📱 <strong>0% Interest Available!</strong>
          </p>
          <p className="text-[#666666]">
            Complete your KYC verification to unlock installment payment options.
          </p>
        </div>
      </div>
    </div>
  );
}
