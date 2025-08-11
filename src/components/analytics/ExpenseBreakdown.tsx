import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ClientExpense } from '@/hooks/useClientAnalytics';
import { Receipt } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExpenseBreakdownProps {
  expenses: ClientExpense[];
}

export function ExpenseBreakdown({ expenses }: ExpenseBreakdownProps) {
  // Group expenses by individual cost components instead of expense_type
  const expenseCategories = {
    "Toll Costs": expenses.reduce((sum, exp) => sum + (exp.toll_cost || 0), 0),
    "Delivery Costs": expenses.reduce((sum, exp) => sum + (exp.delivery_cost || 0), 0),
    "Car Wash": expenses.reduce((sum, exp) => sum + (exp.carwash_cost || 0), 0),
    "EV Charging": expenses.reduce((sum, exp) => sum + (exp.ev_charge_cost || 0), 0),
    "Other Expenses": expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  };

  // Filter out categories with zero amounts and create chart data
  const chartData = Object.entries(expenseCategories)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }));

  const ABBREVIATIONS: Record<string, string> = {
    "Toll Costs": "TC",
    "Delivery Costs": "DC",
    "Car Wash": "CW",
    "EV Charging": "EV",
    "Other Expenses": "OE",
  };

  const getInitials = (label: string) => {
    if (ABBREVIATIONS[label]) return ABBREVIATIONS[label];
    return label
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const chartConfig = {
    value: {
      label: 'Amount',
    },
  };

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);
  const isMobile = useIsMobile();

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
            <Receipt className="h-4 w-4" />
          </div>
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded yet.</p>
              <p className="text-sm mt-1">Expenses will appear here when your hosts log them.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[220px] sm:h-[260px]">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 12, bottom: isMobile ? 24 : 16 }} barCategoryGap={isMobile ? '35%' : '25%'}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => getInitials(String(value))}
                />
                <YAxis 
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" barSize={isMobile ? 12 : 16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium border-t pt-3">
                <span>Total Expenses</span>
                <span className="text-lg">${totalExpenses.toFixed(2)}</span>
              </div>
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.value.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((item.value / totalExpenses) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}