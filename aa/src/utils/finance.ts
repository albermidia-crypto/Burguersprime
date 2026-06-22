import { ClientProfile, FinancialMetrics, SetupConfig } from "../types";

/**
 * Calculates the ROI (Return on Investment) for advertising campaigns.
 * Formula: ((Revenue - Investment) / Investment) * 100
 */
export function calculateROI(investment: number, revenue: number) {
  if (investment <= 0) return 0;
  return ((revenue - investment) / investment) * 100;
}

/**
 * Calculates current Cash Flow projection.
 * Inputs: actual confirmed entries, pipeline expected entries, fixed costs, and variable cost ratio (e.g. 0.40).
 */
export function calculateCashFlow(
  confirmedEntries: number,
  pipelineExpectedEntries: number,
  fixedCosts: number,
  variableExpenses: number
) {
  const currentBalance = confirmedEntries - (fixedCosts + variableExpenses);
  const projected30d = currentBalance + pipelineExpectedEntries - (fixedCosts + variableExpenses);
  const projected60d = currentBalance + (pipelineExpectedEntries * 2) - (fixedCosts * 2 + variableExpenses * 2);
  
  return {
    currentBalance,
    projected30d,
    projected60d,
    isNegative30d: projected30d < 0,
    isNegative60d: projected60d < 0,
  };
}

/**
 * Calculates Customer Acquisition Cost (CAC).
 * Formula: Total capture expenses / New customers
 */
export function calculateCAC(totalCaptureExpenses: number, newCustomersCount: number) {
  if (newCustomersCount <= 0) return 0;
  return totalCaptureExpenses / newCustomersCount;
}

/**
 * Calculates Lifetime Value (LTV).
 * Formula: Ticket Médio * Monthly Freq * Lifetime Months (Assumed 6 months as per business spec)
 */
export function calculateClientLTV(ticketMedio: number, frequency: number, months: number = 6) {
  return ticketMedio * frequency * months;
}

/**
 * Calculates Break-Even Point (Ponto de Equilíbrio) in number of sales.
 * Formula: Custos Fixos / (Ticket Médio * Margem)
 * Margem is average margin (e.g., 60% = 0.60)
 */
export function calculateBreakEven(
  fixedCosts: number,
  ticketMedio: number,
  marginPercent: number = 0.60
) {
  const marginContributionValue = ticketMedio * marginPercent;
  if (marginContributionValue <= 0) return { salesNeeded: 0, revenueNeeded: 0 };
  
  const salesNeeded = Math.ceil(fixedCosts / marginContributionValue);
  const revenueNeeded = salesNeeded * ticketMedio;
  
  return {
    salesNeeded,
    revenueNeeded,
  };
}

/**
 * Evaluates risk of churn based on days since last visit or lack of engagement.
 */
export function checkChurnRisk(client: ClientProfile, daysLimit: number = 10): boolean {
  return client.visitFrequency >= 2 && client.lastVisitDaysAgo >= daysLimit;
}
