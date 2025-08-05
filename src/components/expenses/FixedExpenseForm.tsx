import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateClientCarExpenseData, useClientCarExpenses } from '@/hooks/useClientCarExpenses';
import { X } from 'lucide-react';

interface FixedExpenseFormProps {
  carId: string;
  carName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPENSE_TYPES = [
  { value: 'insurance', label: 'Insurance' },
  { value: 'loan_payment', label: 'Loan Payment' },
  { value: 'registration', label: 'Registration/Tags' },
  { value: 'maintenance_plan', label: 'Maintenance Plan' },
  { value: 'storage', label: 'Storage/Parking' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function FixedExpenseForm({ carId, carName, onClose, onSuccess }: FixedExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const { createExpense } = useClientCarExpenses();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateClientCarExpenseData>({
    defaultValues: {
      car_id: carId,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
    }
  });

  const selectedFrequency = watch('frequency');
  const selectedExpenseType = watch('expense_type');

  const onSubmit = async (data: CreateClientCarExpenseData) => {
    setLoading(true);
    try {
      const success = await createExpense(data);
      if (success) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Add Fixed Expense for {carName}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_type">Expense Type</Label>
              <Select onValueChange={(value) => setValue('expense_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expense_type && (
                <p className="text-sm text-destructive mt-1">Expense type is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select defaultValue="monthly" onValueChange={(value) => setValue('frequency', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">
                Amount ({selectedFrequency || 'monthly'})
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' },
                  valueAsNumber: true 
                })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date', { required: 'Start date is required' })}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
              )}
            </div>
          </div>

          {(selectedExpenseType === 'insurance' || selectedExpenseType === 'loan_payment') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider_name">Provider Name</Label>
                <Input
                  id="provider_name"
                  placeholder="e.g., State Farm, Chase Bank"
                  {...register('provider_name')}
                />
              </div>

              <div>
                <Label htmlFor="policy_number">
                  {selectedExpenseType === 'insurance' ? 'Policy Number' : 'Account Number'}
                </Label>
                <Input
                  id="policy_number"
                  placeholder="Optional"
                  {...register('policy_number')}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date')}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank if this is an ongoing expense
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this expense..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}