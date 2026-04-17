import { ClientExpense } from '@/hooks/useClientAnalytics';

/**
 * Calculate total trip expenses for a given trip_id by summing all cost components.
 */
export function getTripExpensesTotal(
  tripId: string | null | undefined,
  expenses: ClientExpense[]
): number {
  if (!tripId) return 0;
  return expenses
    .filter((exp) => exp.trip_id === tripId)
    .reduce(
      (sum, exp) =>
        sum +
        (exp.amount || 0) +
        (exp.toll_cost || 0) +
        (exp.delivery_cost || 0) +
        (exp.carwash_cost || 0) +
        (exp.ev_charge_cost || 0),
      0
    );
}

/**
 * Calculate the client's share for a single earning after deducting matched trip expenses.
 * Formula: (earning.amount - tripExpenses) × client_profit_percentage / 100
 */
export function getClientShare(
  earningAmount: number,
  clientProfitPercentage: number | null,
  tripId: string | null | undefined,
  expenses: ClientExpense[]
): number {
  const tripExpenses = getTripExpensesTotal(tripId, expenses);
  const net = earningAmount - tripExpenses;
  return (net * (clientProfitPercentage || 70)) / 100;
}

/**
 * Get the net earning amount (gross - trip expenses) for display purposes.
 */
export function getNetEarningAmount(
  earningAmount: number,
  tripId: string | null | undefined,
  expenses: ClientExpense[]
): number {
  const tripExpenses = getTripExpensesTotal(tripId, expenses);
  return earningAmount - tripExpenses;
}
