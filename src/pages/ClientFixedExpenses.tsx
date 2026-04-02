import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FixedExpensesList } from '@/components/expenses/FixedExpensesList';
import { useCars } from '@/hooks/useCars';
import { useClientCarExpenses } from '@/hooks/useClientCarExpenses';
import {
  Car,
  DollarSign,
  Plus,
  TrendingUp,
  Shield,
  Lock,
  CheckCircle,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientFixedExpenses() {
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const { cars, loading: carsLoading } = useCars();
  const { getMonthlyFixedCosts, expenses, loading: expensesLoading } = useClientCarExpenses();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  const clientCars = cars;

  const selectedCar = clientCars.find(car => car.id === selectedCarId);

  if (!selectedCarId && clientCars.length > 0 && !carsLoading) {
    const carWithExpenses = clientCars.find(car => getMonthlyFixedCosts(car.id) > 0);
    setSelectedCarId(carWithExpenses?.id || clientCars[0].id);
  }

  const totalMonthlyFixed = clientCars.reduce((total, car) => total + getMonthlyFixedCosts(car.id), 0);
  const carsWithExpenses = clientCars.filter(car => getMonthlyFixedCosts(car.id) > 0);

  return (
    <DashboardLayout>
      <PageContainer>
        <main className="space-y-5 pb-8">
          {/* Header */}
          <header style={fadeIn(0)} className="flex items-center justify-between gap-2 py-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back" className="h-9 w-9 rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Fixed Expenses</h1>
            <div className="w-9" />
          </header>

          {/* Trust Banner */}
          <div style={fadeIn(1)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/15 p-2.5">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Expense Tracker</h2>
                <p className="text-sm text-muted-foreground">Manage monthly recurring costs for your fleet</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { icon: Lock, label: "Data Encrypted" },
                { icon: Shield, label: "Secure Records" },
                { icon: CheckCircle, label: "Verified Platform" },
              ].map(({ icon: BadgeIcon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
                  <BadgeIcon className="h-3.5 w-3.5 text-primary/70" />{label}
                </span>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div style={fadeIn(2)} className="grid gap-3 grid-cols-3">
            {[
              {
                icon: DollarSign,
                label: "Total Monthly",
                value: `$${totalMonthlyFixed.toFixed(2)}`,
                sub: `Across ${clientCars.length} vehicle${clientCars.length !== 1 ? 's' : ''}`,
                color: "text-green-600",
              },
              {
                icon: Car,
                label: "With Expenses",
                value: String(carsWithExpenses.length),
                sub: `${clientCars.length - carsWithExpenses.length} need setup`,
                color: "text-primary",
              },
              {
                icon: BarChart3,
                label: "Avg per Car",
                value: `$${clientCars.length > 0 ? (totalMonthlyFixed / clientCars.length).toFixed(2) : '0.00'}`,
                sub: "Monthly average",
                color: "text-blue-600",
              },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* Car Selector */}
          <div style={fadeIn(3)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold tracking-tight">Select Vehicle</h2>
            </div>
            <Select value={selectedCarId} onValueChange={setSelectedCarId}>
              <SelectTrigger className="w-full rounded-xl bg-background/50">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {clientCars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model}
                    <span className="ml-2 text-xs text-muted-foreground">
                      (${getMonthlyFixedCosts(car.id).toFixed(2)}/mo)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expenses List */}
          {selectedCar && (
            <div style={fadeIn(4)}>
              <FixedExpensesList
                carId={selectedCar.id}
                carName={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
                readOnly={Boolean((selectedCar as any).is_shared)}
              />
            </div>
          )}

          {/* Quick Setup */}
          {carsWithExpenses.length < clientCars.length && (
            <div style={fadeIn(5)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold tracking-tight">Quick Setup Needed</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                The following vehicles don't have fixed expenses configured yet:
              </p>
              <div className="space-y-2">
                {clientCars
                  .filter(car => getMonthlyFixedCosts(car.id) === 0)
                  .map((car) => (
                    <div key={car.id} className="flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3">
                      <span className="text-sm font-medium">
                        {car.year} {car.make} {car.model}
                      </span>
                      <Button size="sm" className="rounded-xl" onClick={() => setSelectedCarId(car.id)}>
                        Add Expenses
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Trust Footer */}
          <div style={fadeIn(6)} className="flex flex-wrap justify-center gap-4 py-3 text-xs text-muted-foreground">
            {[
              { icon: Lock, label: "256-bit encryption" },
              { icon: Shield, label: "Verified by Teslys" },
            ].map(({ icon: TIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <TIcon className="h-3.5 w-3.5 text-primary/60" />{label}
              </span>
            ))}
          </div>
        </main>
      </PageContainer>
    </DashboardLayout>
  );
}
