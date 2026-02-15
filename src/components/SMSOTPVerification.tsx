import { useState, useRef, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface SMSOTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  contractDetails?: {
    totalAmount: number;
    monthlyPayment: number;
    duration: number;
  };
}

export function SMSOTPVerification({
  phoneNumber,
  onVerify,
  onBack,
  contractDetails,
}: SMSOTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = (otpValue: string) => {
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // Simulate verification (in production, this would call an API)
    // For demo: accept 123456 as valid OTP
    if (otpValue === '123456') {
      onVerify(otpValue);
    } else {
      setError('Invalid OTP. Please try again or use 123456 for demo');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setError('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsResending(false);
    setCountdown(60);
    inputRefs.current[0]?.focus();
  };

  // Format Egyptian phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Expected format: 01XXXXXXXXX (11 digits)
    if (phone.length === 11) {
      return `+20 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0055AA] rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[#003366] mb-2">Verify Your Contract</h2>
        <p className="text-[#666666]">
          We've sent a 6-digit code to
        </p>
        <p className="text-[#003366] font-medium mt-1">
          {formatPhoneNumber(phoneNumber)}
        </p>
      </div>

      {/* Contract Summary */}
      {contractDetails && (
        <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFE8CC] border border-[#FF6600]/30 rounded-lg p-4 mb-6">
          <p className="text-[#1A1A1A] font-medium mb-2">
            Contract Summary
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666666]">Monthly Payment:</span>
              <span className="text-[#FF6600] font-bold">
                {contractDetails.monthlyPayment.toLocaleString()} EGP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Duration:</span>
              <span className="text-[#1A1A1A]">
                {contractDetails.duration} months
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#FF6600]/20">
              <span className="text-[#666666]">Total Amount:</span>
              <span className="text-[#003366] font-bold">
                {contractDetails.totalAmount.toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* OTP Input */}
      <div className="mb-6">
        <label className="block text-[#1A1A1A] mb-3 text-center">
          Enter Verification Code
        </label>
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-colors ${
                error
                  ? 'border-[#FF4444] bg-[#FFF5F5]'
                  : digit
                  ? 'border-[#00C851] bg-[#F0FFF4]'
                  : 'border-[#F0F4F8] focus:border-[#003366]'
              }`}
              autoFocus={index === 0}
            />
          ))}
        </div>
        {error && (
          <p className="text-[#FF4444] text-sm mt-3 text-center">{error}</p>
        )}
      </div>

      {/* Demo Hint */}
      <div className="bg-[#F0F4F8] border-l-4 border-[#003366] rounded p-3 mb-6">
        <p className="text-[#666666] text-xs">
          <strong>Demo Mode:</strong> Use code <strong>123456</strong> to verify
        </p>
      </div>

      {/* Resend Code */}
      <div className="text-center mb-6">
        {countdown > 0 ? (
          <p className="text-[#666666] text-sm">
            Resend code in <span className="text-[#003366] font-medium">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-[#003366] hover:text-[#FF6600] font-medium text-sm flex items-center gap-2 mx-auto transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
            Resend Code
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-[#003366] text-[#003366] py-3 rounded-lg hover:bg-[#F0F4F8] transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={otp.some((digit) => !digit)}
          className="flex-1 bg-[#FF6600] hover:bg-[#FF6600]/90 disabled:bg-[#CCCCCC] text-white py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          Verify & Sign
        </button>
      </div>

      {/* Security Note */}
      <p className="text-[#666666] text-xs text-center mt-6">
        By verifying, you agree to digitally sign the installment contract.
        Your signature is legally binding.
      </p>
    </div>
  );
}
