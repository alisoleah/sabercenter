import { InstallmentPlan } from '../types';

export function calculateInstallment(
  price: number,
  downPayment: number,
  months: number,
  interestRate: number = 0
): InstallmentPlan {
  const principal = price - downPayment;
  const monthlyInterest = interestRate / 12 / 100;
  
  let monthlyPayment: number;
  
  if (interestRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment = 
      (principal * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
      (Math.pow(1 + monthlyInterest, months) - 1);
  }
  
  const totalAmount = downPayment + (monthlyPayment * months);
  
  return {
    months,
    monthlyPayment: Math.round(monthlyPayment),
    downPayment,
    totalAmount: Math.round(totalAmount),
    interestRate,
  };
}

export function calculateCreditLimit(
  nationalId: string,
  monthlyIncome?: number
): number {
  // Mock credit limit calculation
  // In a real app, this would call a backend API
  const hash = nationalId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseLimit = 10000 + (hash % 40000);
  
  if (monthlyIncome) {
    return Math.min(baseLimit, monthlyIncome * 10);
  }
  
  return baseLimit;
}
