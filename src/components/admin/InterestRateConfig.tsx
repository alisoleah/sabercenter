import { useState } from 'react';
import { Percent, Calendar, Tag, Save } from 'lucide-react';
import type { InstallmentPlanConfig } from '../../types';

interface InterestRateConfigProps {
  plans: InstallmentPlanConfig[];
  categories: string[];
  onUpdatePlan: (planId: string, updates: Partial<InstallmentPlanConfig>) => void;
  onCreatePlan: (plan: Omit<InstallmentPlanConfig, 'id'>) => void;
  onDeletePlan: (planId: string) => void;
}

export function InterestRateConfig({
  plans,
  categories,
  onUpdatePlan,
  onCreatePlan,
  onDeletePlan,
}: InterestRateConfigProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    name: '',
    durationMonths: 12,
    interestRate: 0,
    minDownPayment: 10,
    isActive: true,
    applicableCategories: [] as string[],
  });

  const handleEdit = (plan: InstallmentPlanConfig) => {
    setNewPlan({
      name: plan.name,
      durationMonths: plan.durationMonths,
      interestRate: plan.interestRate,
      minDownPayment: plan.minDownPayment,
      isActive: plan.isActive,
      applicableCategories: plan.applicableCategories || [],
    });
    setEditingId(plan.id);
    setShowNewPlanForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      onDeletePlan(id);
    }
  };

  const handleSavePlan = () => {
    if (editingId) {
      onUpdatePlan(editingId, newPlan);
    } else {
      onCreatePlan(newPlan);
    }
    setNewPlan({
      name: '',
      durationMonths: 12,
      interestRate: 0,
      minDownPayment: 10,
      isActive: true,
      applicableCategories: [],
    });
    setEditingId(null);
    setShowNewPlanForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-white">Interest Rate Configuration</h2>
        <button
          onClick={() => {
            setShowNewPlanForm(!showNewPlanForm);
            setEditingId(null);
            setNewPlan({
              name: '',
              durationMonths: 12,
              interestRate: 0,
              minDownPayment: 10,
              isActive: true,
              applicableCategories: [],
            });
          }}
          className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showNewPlanForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      <div className="p-6">
        {/* New/Edit Plan Form */}
        {showNewPlanForm && (
          <div className="mb-6 bg-[#F0F4F8] rounded-lg p-4 border-2 border-[#003366]">
            <h3 className="text-[#003366] font-medium mb-4">{editingId ? 'Edit Plan' : 'Create New Installment Plan'}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-[#1A1A1A] mb-2">Plan Name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#E0E0E0] rounded-lg outline-none focus:border-[#003366]"
                  placeholder="e.g., Ramadan Special - 12 Months"
                />
              </div>
              <div>
                <label className="block text-[#1A1A1A] mb-2">Duration (Months)</label>
                <select
                  value={newPlan.durationMonths}
                  onChange={(e) => setNewPlan({ ...newPlan, durationMonths: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-[#E0E0E0] rounded-lg outline-none focus:border-[#003366]"
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-[#1A1A1A] mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  value={newPlan.interestRate}
                  onChange={(e) => setNewPlan({ ...newPlan, interestRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-[#E0E0E0] rounded-lg outline-none focus:border-[#003366]"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[#1A1A1A] mb-2">Min Down Payment (%)</label>
                <input
                  type="number"
                  value={newPlan.minDownPayment}
                  onChange={(e) => setNewPlan({ ...newPlan, minDownPayment: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-[#E0E0E0] rounded-lg outline-none focus:border-[#003366]"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
              {/* Categories Selection */}
              <div className="col-span-2">
                <label className="block text-[#1A1A1A] mb-2">Applicable Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        const current = newPlan.applicableCategories;
                        if (current.includes(cat)) {
                          setNewPlan({ ...newPlan, applicableCategories: current.filter(c => c !== cat) });
                        } else {
                          setNewPlan({ ...newPlan, applicableCategories: [...current, cat] });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newPlan.applicableCategories.includes(cat)
                        ? 'bg-[#003366] text-white'
                        : 'bg-white border border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleSavePlan}
              disabled={!newPlan.name}
              className="w-full bg-[#00C851] hover:bg-[#00C851]/90 disabled:bg-[#CCCCCC] text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        )}

        {/* Existing Plans */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border-2 border-[#F0F4F8] rounded-lg p-4 hover:border-[#003366] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-[#003366] font-medium mb-1">{plan.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#666666]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {plan.durationMonths} months
                    </div>
                    <div className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      {plan.interestRate}% interest
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {plan.minDownPayment}% down payment
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-[#003366] hover:text-[#004d99]"
                    title="Edit Plan"
                  >
                    <p className="text-sm font-semibold">Edit</p>
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Plan"
                  >
                    <p className="text-sm font-semibold">Delete</p>
                  </button>
                </div>
                {/* Active Toggle */}
                <div className="flex items-center gap-2 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={(e) => onUpdatePlan(plan.id, { isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#CCCCCC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C851]"></div>
                  </label>
                  <span className="text-sm text-[#666666]">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Applicable Categories */}
              {plan.applicableCategories && plan.applicableCategories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#F0F4F8]">
                  <p className="text-[#666666] text-xs mb-2">Applicable to:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.applicableCategories.map((category) => (
                      <span
                        key={category}
                        className="bg-[#FFF4E6] text-[#FF6600] px-2 py-1 rounded text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}


            </div>
          ))}
        </div>

        {/* Category-specific Interest Rates */}
        <div className="mt-6 pt-6 border-t border-[#F0F4F8]">
          <h3 className="text-[#003366] font-medium mb-4">Category-Specific Rates</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const categoryPlans = plans.filter(
                (p) => p.applicableCategories?.includes(category)
              );
              return (
                <div
                  key={category}
                  className="bg-[#F0F4F8] rounded-lg p-3"
                >
                  <p className="text-[#003366] font-medium mb-1">{category}</p>
                  <p className="text-[#666666] text-sm">
                    {categoryPlans.length > 0
                      ? `${categoryPlans.length} special plan(s)`
                      : 'All plans available'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
