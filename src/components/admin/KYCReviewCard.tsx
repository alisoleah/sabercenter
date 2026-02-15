import { useState } from 'react';
import { User, Phone, Briefcase, MapPin, Calendar, FileText, Eye } from 'lucide-react';
import type { Profile } from '../../types';

interface KYCReviewCardProps {
  application: Profile & { userName: string; userPhone: string };
  onApprove: (userId: string, creditLimit: number) => void;
  onReject: (userId: string, reason: string) => void;
}

export function KYCReviewCard({ application, onApprove, onReject }: KYCReviewCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#00C851] text-white';
      case 'Rejected':
        return 'bg-[#FF4444] text-white';
      default:
        return 'bg-[#FF6600] text-white';
    }
  };

  const calculateSuggestedLimit = () => {
    // Simple calculation: 10x monthly salary, capped at 100,000 EGP
    return Math.min(application.monthlySalary * 10, 100000);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border-2 border-[#F0F4F8] hover:border-[#003366] transition-all">
        {/* Header */}
        <div className="p-4 border-b border-[#F0F4F8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#0055AA] rounded-full flex items-center justify-center text-white font-bold">
              {application.userName.charAt(0)}
            </div>
            <div>
              <h3 className="text-[#1A1A1A] font-medium">{application.userName}</h3>
              <p className="text-[#666666] text-sm">{application.nationalId}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.kycStatus)}`}>
            {application.kycStatus}
          </span>
        </div>

        {/* Quick Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-[#666666]" />
            <span className="text-[#1A1A1A]">{application.userPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-[#666666]" />
            <span className="text-[#1A1A1A]">{application.employer}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#666666]" />
            <span className="text-[#666666]">Submitted: {formatDate(application.kycSubmittedAt)}</span>
          </div>

          {/* Salary & Suggested Limit */}
          <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFE8CC] border border-[#FF6600]/30 rounded-lg p-3 mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[#666666] text-sm">Monthly Salary:</span>
              <span className="text-[#003366] font-bold">{application.monthlySalary.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#666666] text-sm">Suggested Limit:</span>
              <span className="text-[#FF6600] font-bold">{calculateSuggestedLimit().toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#F0F4F8] flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 bg-white border-2 border-[#003366] text-[#003366] py-2 px-4 rounded-lg hover:bg-[#F0F4F8] transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showDetails ? 'Hide' : 'View'} Documents
          </button>
          {application.kycStatus === 'Pending' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex-1 bg-[#00C851] hover:bg-[#00C851]/90 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Review
            </button>
          )}
        </div>

        {/* Document Preview */}
        {showDetails && (
          <div className="p-4 border-t border-[#F0F4F8] bg-[#F0F4F8] space-y-4">
            <div>
              <h4 className="text-[#003366] font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                National ID
              </h4>
              <img
                src={application.scannedIdUrl}
                alt="National ID"
                className="w-full rounded-lg border-2 border-[#E0E0E0]"
              />
            </div>
            <div>
              <h4 className="text-[#003366] font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Utility Bill
              </h4>
              <img
                src={application.utilityBillUrl}
                alt="Utility Bill"
                className="w-full rounded-lg border-2 border-[#E0E0E0]"
              />
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#666666]" />
                <span className="text-[#003366] font-medium">Address:</span>
              </div>
              <p className="text-[#1A1A1A] text-sm">{application.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-white">Review KYC Application</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-[#1A1A1A] font-medium mb-2">{application.userName}</p>
                <p className="text-[#666666] text-sm">National ID: {application.nationalId}</p>
              </div>

              <div className="bg-[#F0F4F8] rounded-lg p-4 mb-6">
                <label className="block text-[#003366] font-medium mb-2">
                  Credit Limit (EGP)
                </label>
                <input
                  type="number"
                  id="creditLimit"
                  defaultValue={calculateSuggestedLimit()}
                  className="w-full px-4 py-2 border-2 border-[#E0E0E0] rounded-lg outline-none focus:border-[#003366]"
                  min="1000"
                  max="200000"
                  step="1000"
                />
                <p className="text-[#666666] text-xs mt-2">
                  Suggested: {calculateSuggestedLimit().toLocaleString()} EGP (10x monthly salary)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const input = document.getElementById('creditLimit') as HTMLInputElement;
                    onReject(application.userId, 'Documents not clear');
                    setShowApprovalModal(false);
                  }}
                  className="flex-1 bg-[#FF4444] hover:bg-[#FF4444]/90 text-white py-3 rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    const input = document.getElementById('creditLimit') as HTMLInputElement;
                    onApprove(application.userId, Number(input.value));
                    setShowApprovalModal(false);
                  }}
                  className="flex-1 bg-[#00C851] hover:bg-[#00C851]/90 text-white py-3 rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-full mt-3 bg-white border-2 border-[#003366] text-[#003366] py-2 rounded-lg hover:bg-[#F0F4F8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
