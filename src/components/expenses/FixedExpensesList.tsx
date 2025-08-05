import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientCarExpenses } from '@/hooks/useClientCarExpenses';
import { Edit2, Trash2, Plus, DollarSign } from 'lucide-react';
import { FixedExpenseForm } from './FixedExpenseForm';

interface FixedExpensesListProps {
  carId: string;
  carName: string;
}

export function FixedExpensesList({ carId, carName }: FixedExpensesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const { expenses, getExpensesByCarId, getMonthlyFixedCosts, deleteExpense, loading } = useClientCarExpenses();
  
  const carExpenses = getExpensesByCarId(carId);
  const monthlyTotal = getMonthlyFixedCosts(carId);

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const formatAmount = (amount: number, frequency: string) => {
    const monthlyAmount = frequency === 'yearly' ? amount / 12 : 
                         frequency === 'quarterly' ? amount / 3 : amount;
    return `$${amount.toFixed(2)} ${frequency} ($${monthlyAmount.toFixed(2)}/month)`;
  };

  const getFrequencyBadgeVariant = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'default';
      case 'quarterly': return 'secondary';
      case 'yearly': return 'outline';
      default: return 'default';
    }
  };

  if (showForm) {
    return (
      <FixedExpenseForm
        carId={carId}
        carName={carName}
        editExpense={editingExpense}
        onClose={handleCloseForm}
        onSuccess={handleCloseForm}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Fixed Expenses - {carName}</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${monthlyTotal.toFixed(2)}/month total</span>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
        ) : carExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No fixed expenses added yet.</p>
            <p className="text-sm">Add insurance, loan payments, and other recurring costs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {carExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium capitalize">
                      {expense.expense_type.replace('_', ' ')}
                    </h4>
                    <Badge variant={getFrequencyBadgeVariant(expense.frequency)}>
                      {expense.frequency}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {formatAmount(expense.amount, expense.frequency)}
                  </p>
                  {expense.provider_name && (
                    <p className="text-xs text-muted-foreground">
                      Provider: {expense.provider_name}
                    </p>
                  )}
                  {expense.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {expense.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Active since: {new Date(expense.start_date).toLocaleDateString()}
                    {expense.end_date && ` - ${new Date(expense.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(expense)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(expense.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}