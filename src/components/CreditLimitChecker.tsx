import { useState } from 'react';
import { CreditCard, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { calculateCreditLimit } from '../utils/installmentCalculator';

export function CreditLimitChecker() {
  const [nationalId, setNationalId] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);

  const handleCheckLimit = () => {
    if (nationalId.length !== 14) {
      alert('Please enter a valid 14-digit National ID');
      return;
    }

    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const limit = calculateCreditLimit(nationalId);
      setCreditLimit(limit);
      setIsChecking(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-8 h-8 text-[#003366]" />
          <h1 className="text-[#003366]">Check Your Credit Limit</h1>
        </div>

        <p className="text-[#666666] mb-8">
          Complete your KYC verification to unlock installment payment options and discover your eligible credit limit.
        </p>

        {/* National ID Input */}
        <div className="mb-6">
          <label className="block text-[#1A1A1A] mb-2">
            National ID Number
          </label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 14))}
            placeholder="Enter 14-digit National ID"
            className="w-full px-4 py-3 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366] transition-colors"
            maxLength={14}
          />
          <p className="text-[#666666] text-xs mt-1">
            {nationalId.length}/14 digits
          </p>
        </div>

        {/* ID Upload Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-[#1A1A1A] mb-2">
              National ID (Front)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                idFrontUploaded
                  ? 'border-[#00C851] bg-[#00C851]/5'
                  : 'border-[#F0F4F8] hover:border-[#003366]'
              }`}
              onClick={() => setIdFrontUploaded(true)}
            >
              {idFrontUploaded ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-[#00C851]" />
                  <p className="text-[#00C851]">Front uploaded</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-[#666666]" />
                  <p className="text-[#666666]">Click to upload</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[#1A1A1A] mb-2">
              National ID (Back)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                idBackUploaded
                  ? 'border-[#00C851] bg-[#00C851]/5'
                  : 'border-[#F0F4F8] hover:border-[#003366]'
              }`}
              onClick={() => setIdBackUploaded(true)}
            >
              {idBackUploaded ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-[#00C851]" />
                  <p className="text-[#00C851]">Back uploaded</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-[#666666]" />
                  <p className="text-[#666666]">Click to upload</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheckLimit}
          disabled={nationalId.length !== 14 || !idFrontUploaded || !idBackUploaded || isChecking}
          className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 disabled:bg-[#666666] text-white py-3 rounded-lg transition-colors mb-6"
        >
          {isChecking ? 'Checking...' : 'Check Credit Limit'}
        </button>

        {/* Results */}
        {creditLimit !== null && (
          <div className="bg-gradient-to-br from-[#003366] to-[#004488] rounded-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-[#00C851]" />
              <h2 className="text-white">Verification Successful!</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/70 mb-2">Your Credit Limit</p>
                <p className="text-white text-3xl">
                  {creditLimit.toLocaleString()} EGP
                </p>
              </div>
              <div>
                <p className="text-white/70 mb-2">Available Plans</p>
                <div className="flex gap-2 flex-wrap">
                  {[6, 12, 18, 24, 36].map((months) => (
                    <span key={months} className="bg-white/20 px-3 py-1 rounded">
                      {months}m
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 bg-white/10 rounded-lg p-4">
              <p className="text-white/90">
                ✨ You can now purchase products up to {creditLimit.toLocaleString()} EGP with 0% interest installments!
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-[#FFF4E6] border border-[#FF6600]/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-[#FF6600] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-[#1A1A1A] mb-2">Important Information</h3>
              <ul className="text-[#666666] space-y-1 list-disc list-inside">
                <li>Your National ID will be verified instantly</li>
                <li>Credit limit is calculated based on multiple factors</li>
                <li>All data is encrypted and securely stored</li>
                <li>Figma Make is not meant for collecting PII or securing sensitive data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
