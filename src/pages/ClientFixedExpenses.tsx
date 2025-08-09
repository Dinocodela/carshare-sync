import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FixedExpensesList } from '@/components/expenses/FixedExpensesList';
import { useCars } from '@/hooks/useCars';
import { useClientCarExpenses } from '@/hooks/useClientCarExpenses';
import { Car, DollarSign, Plus, TrendingDown, TrendingUp } from 'lucide-react';

export default function ClientFixedExpenses() {
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const { cars, loading: carsLoading } = useCars();
  const { getMonthlyFixedCosts, expenses, loading: expensesLoading } = useClientCarExpenses();

  // Use all accessible cars (owned + shared)
  const accessibleCars = cars;
  const clientCars = accessibleCars;
  
  console.log('ClientFixedExpenses Debug:', {
    cars: clientCars.length,
    expenses: expenses.length,
    selectedCarId,
    carsLoading,
    expensesLoading
  });

  const selectedCar = clientCars.find(car => car.id === selectedCarId);

  // Auto-select first car with expenses or first car if none selected
  if (!selectedCarId && clientCars.length > 0 && !carsLoading) {
    const carWithExpenses = clientCars.find(car => getMonthlyFixedCosts(car.id) > 0);
    setSelectedCarId(carWithExpenses?.id || clientCars[0].id);
  }

  const totalMonthlyFixed = clientCars.reduce((total, car) => {
    return total + getMonthlyFixedCosts(car.id);
  }, 0);

  const carsWithExpenses = clientCars.filter(car => getMonthlyFixedCosts(car.id) > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fixed Expenses</h1>
            <p className="text-muted-foreground">
              Manage monthly recurring costs for your vehicles
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Fixed Costs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlyFixed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across {clientCars.length} vehicle{clientCars.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars with Fixed Expenses</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carsWithExpenses.length}</div>
              <p className="text-xs text-muted-foreground">
                {clientCars.length - carsWithExpenses.length} cars need expense setup
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Car</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${clientCars.length > 0 ? (totalMonthlyFixed / clientCars.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly fixed costs per vehicle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Car Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Fixed Expenses by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model}
                        <span className="ml-2 text-xs text-muted-foreground">
                          (${getMonthlyFixedCosts(car.id).toFixed(2)}/month)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Car Expenses */}
        {selectedCar && (
          <FixedExpensesList
            carId={selectedCar.id}
            carName={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
            readOnly={Boolean((selectedCar as any).is_shared)}
          />
        )}

        {/* Quick Setup for Cars Without Expenses */}
        {carsWithExpenses.length < clientCars.length && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Quick Setup Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The following vehicles don't have fixed expenses configured yet:
              </p>
              <div className="space-y-2">
                {clientCars
                  .filter(car => getMonthlyFixedCosts(car.id) === 0)
                  .map((car) => (
                    <div key={car.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">
                        {car.year} {car.make} {car.model}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setSelectedCarId(car.id)}
                      >
                        Add Expenses
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}