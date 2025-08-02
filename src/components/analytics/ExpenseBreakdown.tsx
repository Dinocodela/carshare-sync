import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ClientExpense } from '@/hooks/useClientAnalytics';
import { Receipt } from 'lucide-react';

interface ExpenseBreakdownProps {
  expenses: ClientExpense[];
}

export function ExpenseBreakdown({ expenses }: ExpenseBreakdownProps) {
  // Group expenses by type, calculating total from individual components
  const expenseByType = expenses.reduce((acc, expense) => {
    // Calculate total expense from individual cost components
    const totalExpense = (expense.amount || 0) + 
                        (expense.toll_cost || 0) + 
                        (expense.delivery_cost || 0) + 
                        (expense.carwash_cost || 0) + 
                        (expense.ev_charge_cost || 0);
    
    if (totalExpense > 0) {
      const type = expense.expense_type || 'Other';
      acc[type] = (acc[type] || 0) + totalExpense;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expenseByType).map(([type, amount]) => ({
    name: type,
    value: amount,
  }));

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

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
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
            <ChartContainer config={chartConfig} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={25}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
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