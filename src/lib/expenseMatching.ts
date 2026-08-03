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

/** Eon/platform commission retained before the host is paid. */
export const PLATFORM_COMMISSION_RATE = 0.3;

/**
 * Client (or host) earnings derived from the platform `break_down` payload —
 * mirrors the "How this is calculated" breakdown on the Trip Detail page:
 *   subtotal (rental total + discounts) − 30% platform fee = net rental
 *   net rental × client% = client share (remainder = management fee)
 * Returns null when the row has no usable break_down.
 */
export function getEarningsFromBreakdown(
  breakDown: unknown,
  clientProfitPercentage: number | null,
  isHost = false
): number | null {
  let bd: any = breakDown;
  if (typeof bd === 'string') {
    try {
      bd = JSON.parse(bd);
    } catch {
      return null;
    }
  }
  const items = Array.isArray(bd?.rental_prices)
    ? bd.rental_prices
        .map((p: any) => ({ rate: Number(p?.rate) || 0, count: Number(p?.count) || 0 }))
        .filter((p: any) => p.count > 0)
    : [];
  if (items.length === 0) return null;

  const grossRental = items.reduce((s: number, p: any) => s + p.rate * p.count, 0);
  const subTotal =
    grossRental + (Number(bd.weekly_discount) || 0) + (Number(bd.monthly_discount) || 0);
  const rentalNet = subTotal - subTotal * PLATFORM_COMMISSION_RATE;
  const clientShare = (rentalNet * (clientProfitPercentage ?? 70)) / 100;
  return isHost ? rentalNet - clientShare : clientShare;
}

