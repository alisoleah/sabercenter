import { Filter } from 'lucide-react';

interface BudgetFilterProps {
  selectedBudget: number;
  onBudgetChange: (budget: number) => void;
}

export function BudgetFilter({ selectedBudget, onBudgetChange }: BudgetFilterProps) {
  const budgetRanges = [
    { value: 0, label: 'All Products' },
    { value: 300, label: 'Under 300 EGP/mo' },
    { value: 500, label: '300-500 EGP/mo' },
    { value: 1000, label: '500-1,000 EGP/mo' },
    { value: 2000, label: '1,000-2,000 EGP/mo' },
    { value: 5000, label: '2,000-5,000 EGP/mo' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[#003366]">
          <Filter className="w-5 h-5" />
          <label className="font-medium">Monthly Budget:</label>
        </div>
        <select
          value={selectedBudget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="flex-1 min-w-[200px] px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366] text-[#1A1A1A] cursor-pointer"
        >
          {budgetRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        {selectedBudget > 0 && (
          <div className="bg-gradient-to-r from-[#FFF4E6] to-[#FFE8CC] border border-[#FF6600]/30 rounded-lg px-4 py-2">
            <p className="text-[#FF6600] text-sm">
              Showing products with monthly payments up to{' '}
              <span className="font-bold">{selectedBudget.toLocaleString()} EGP</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
