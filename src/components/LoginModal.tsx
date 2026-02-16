import { useState } from 'react';
import { X, User, Lock, Mail, Phone, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth.api';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { name: string; phone: string; role: string }) => void;
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phone: string) => {
    const egyptianPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    return egyptianPhoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    // Relaxed validation for dev/testing
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid Egyptian phone number (01XXXXXXXXX)';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    // Validate register-specific fields
    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        if (mode === 'login') {
          const response = await authApi.login({
            phoneNumber: formData.phone,
            password: formData.password,
          });

          console.log('Login response:', response.data);

          const userObj = {
            name: response.data.user.fullName,
            phone: response.data.user.phoneNumber,
            role: response.data.user.role,
          };

          console.log('Calling onLoginSuccess with:', userObj);
          onLoginSuccess(userObj);

          console.log('Login success, closing modal');
          onClose();
        } else {
          const response = await authApi.register({
            fullName: formData.name,
            phoneNumber: formData.phone,
            email: formData.email,
            password: formData.password,
          });

          onLoginSuccess({
            name: response.data.user.fullName,
            phone: response.data.user.phoneNumber,
            role: response.data.user.role,
          });
          onClose();
        }
      } catch (error: any) {
        // Handle API errors
        const errorMessage =
          error.response?.data?.message || error.message || 'An error occurred. Please try again.';
        setErrors({ general: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg flex items-center justify-between sticky top-0">
          <h2 className="text-white">
            {mode === 'login' ? 'Login to SaberStore' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FF6600] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-[#F0F4F8] rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'login'
                ? 'bg-[#003366] text-white'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'register'
                ? 'bg-[#003366] text-white'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[#1A1A1A] mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#666666]" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-[#003366] ${errors.name ? 'border-[#FF4444]' : 'border-[#F0F4F8]'
                    }`}
                  placeholder="Ahmed Mohamed"
                />
                {errors.name && (
                  <p className="text-[#FF4444] text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[#1A1A1A] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#666666]" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-[#003366] ${errors.email ? 'border-[#FF4444]' : 'border-[#F0F4F8]'
                    }`}
                  placeholder="ahmed@example.com"
                />
                {errors.email && (
                  <p className="text-[#FF4444] text-sm mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-[#1A1A1A] mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#666666]" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-[#003366] ${errors.phone ? 'border-[#FF4444]' : 'border-[#F0F4F8]'
                  }`}
                placeholder="01XXXXXXXXX"
                maxLength={11}
              />
              {errors.phone && (
                <p className="text-[#FF4444] text-sm mt-1">{errors.phone}</p>
              )}
              <p className="text-[#666666] text-xs mt-1">
                Egyptian mobile number (11 digits starting with 01)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#1A1A1A] mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#666666]" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg outline-none focus:border-[#003366] ${errors.password ? 'border-[#FF4444]' : 'border-[#F0F4F8]'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[#FF4444] text-sm mt-1">{errors.password}</p>
              )}
              {mode === 'register' && (
                <p className="text-[#666666] text-xs mt-1">
                  Min 6 characters
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-[#FF4444]/10 border border-[#FF4444] text-[#FF4444] rounded-lg p-3">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="bg-[#F0F4F8] border-l-4 border-[#003366] rounded p-3">
              <p className="text-[#666666] text-xs mb-1">
                <strong>Demo Mode:</strong> Use any Egyptian phone number
              </p>
              <p className="text-[#666666] text-xs">
                Example: 01012345678
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading
                ? mode === 'login'
                  ? 'Logging in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>
          </form>

          {/* Additional Options */}
          {mode === 'login' && (
            <div className="mt-4 text-center">
              <button className="text-[#003366] hover:text-[#FF6600] text-sm transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-4 text-center">
              <p className="text-[#666666] text-xs">
                By registering, you agree to our{' '}
                <a href="#" className="text-[#003366] hover:text-[#FF6600]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#003366] hover:text-[#FF6600]">
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
