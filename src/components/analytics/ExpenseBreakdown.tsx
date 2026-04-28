import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ClientExpense } from '@/hooks/useClientAnalytics';
import { Info, Receipt } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpenseBreakdownProps {
  expenses: ClientExpense[];
}

const OTHER_EXPENSES_EXPLANATION =
  'Other Expenses may include Turo long-term rental discounts or guest discounts applied by Turo for monthly or subscription-style rentals. These are platform adjustments to the trip payout, not unexpected charges from Teslys or the host.';

const OTHER_EXPENSES_SHORT_EXPLANATION =
  'This often reflects Turo discounts given to guests on longer rentals. It helps explain the net payout and does not mean the client is being charged extra.';

function ExpenseTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  const isOtherExpenses = item?.name === 'Other Expenses';

  return (
    <div className="max-w-[280px] rounded-xl border border-border/60 bg-background/95 p-3 text-xs shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-foreground">{item?.name}</span>
        <span className="font-mono font-semibold tabular-nums text-foreground">
          ${Number(item?.value || 0).toFixed(2)}
        </span>
      </div>
      {isOtherExpenses && (
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {OTHER_EXPENSES_EXPLANATION}
        </p>
      )}
    </div>
  );
}

export function ExpenseBreakdown({ expenses }: ExpenseBreakdownProps) {
  const isMobile = useIsMobile();

  const expenseCategories = {
    "Toll Costs": expenses.reduce((sum, exp) => sum + (exp.toll_cost || 0), 0),
    "Delivery Costs": expenses.reduce((sum, exp) => sum + (exp.delivery_cost || 0), 0),
    "Car Wash": expenses.reduce((sum, exp) => sum + (exp.carwash_cost || 0), 0),
    "EV Charging": expenses.reduce((sum, exp) => sum + (exp.ev_charge_cost || 0), 0),
    "Other Expenses": expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  };

  const chartData = Object.entries(expenseCategories)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({ name: category, value: amount }));

  const ABBREVIATIONS: Record<string, string> = {
    "Toll Costs": "TC", "Delivery Costs": "DC", "Car Wash": "CW", "EV Charging": "EV", "Other Expenses": "OE",
  };

  const getInitials = (label: string) => ABBREVIATIONS[label] || label.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase();

  const COLORS = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
  ];

  const chartConfig = { value: { label: 'Amount' } };
  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Receipt className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Expense Breakdown</h3>
      </div>
      <div className="px-4 pb-4">
        {chartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No expenses recorded yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Expenses appear when hosts log them</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[200px] sm:h-[240px]">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 12, bottom: isMobile ? 24 : 16 }} barCategoryGap={isMobile ? '35%' : '25%'}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(value) => getInitials(String(value))} />
                <YAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-0 bg-background/95 backdrop-blur-sm shadow-2xl" />} formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                <Bar dataKey="value" barSize={isMobile ? 12 : 16} radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground">${totalExpenses.toFixed(2)}</span>
              </div>
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">${item.value.toFixed(2)}</span>
                    <span className="text-muted-foreground/70 w-10 text-right">
                      {((item.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
