import { useMemo, useState } from "react";
import { format, parseISO, isWithinInterval, startOfMonth, startOfYear } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  ChevronDown,
  CreditCard,
  Hash,
  MapPin,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { useCarBookings } from "@/hooks/useCarBookings";
import {
  getNetEarningAmount,
  getTripExpensesTotal,
} from "@/lib/expenseMatching";
import { cn } from "@/lib/utils";

interface CarSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string | null;
  location?: string | null;
}

interface Props {
  car: CarSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RangeKey = "all" | "year" | "month";

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

const parseDbDate = (d?: string | null) => {
  if (!d) return null;
  // Honour the project-wide date-parsing standard.
  const safe = d.length <= 10 ? `${d}T00:00:00` : d;
  try {
    return parseISO(safe);
  } catch {
    return null;
  }
};

export function CarBookingHistoryModal({ car, open, onOpenChange }: Props) {
  const { earnings, expenses, loading, error } = useCarBookings(open ? car?.id ?? null : null);
  const [range, setRange] = useState<RangeKey>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (range === "all") return earnings;
    const now = new Date();
    const start = range === "year" ? startOfYear(now) : startOfMonth(now);
    return earnings.filter((e) => {
      const d = parseDbDate(e.earning_period_start);
      if (!d) return false;
      return isWithinInterval(d, { start, end: now });
    });
  }, [earnings, range]);

  const totals = useMemo(() => {
    let gross = 0;
    let net = 0;
    let paid = 0;
    let pending = 0;
    for (const e of filtered) {
      const g = Number(e.gross_earnings ?? e.amount ?? 0);
      const n = getNetEarningAmount(Number(e.amount ?? 0), e.trip_id, expenses);
      gross += g;
      net += n;
      if (e.payment_status === "paid") paid += n;
      else pending += n;
    }
    return { gross, net, paid, pending, count: filtered.length };
  }, [filtered, expenses]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <SheetHeader className="px-6 pt-6 pb-4 text-left space-y-2">
            <SheetTitle className="text-xl">
              Booking History
              {car && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {car.year} {car.make} {car.model}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {car?.license_plate && (
                <span className="inline-flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {car.license_plate}
                </span>
              )}
              {car?.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {car.location}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Range filter */}
          <div className="px-6 pb-4 flex gap-2">
            {(["all", "year", "month"] as RangeKey[]).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={range === k ? "default" : "outline"}
                className="rounded-full h-8"
                onClick={() => setRange(k)}
              >
                {k === "all" ? "All time" : k === "year" ? "This year" : "This month"}
              </Button>
            ))}
          </div>

          {/* Summary chips */}
          <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryChip label="Trips" value={String(totals.count)} />
            <SummaryChip label="Gross" value={fmtMoney(totals.gross)} />
            <SummaryChip label="Net" value={fmtMoney(totals.net)} accent />
            <SummaryChip
              label="Paid / Pending"
              value={`${fmtMoney(totals.paid)} · ${fmtMoney(totals.pending)}`}
            />
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          {loading && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </>
          )}

          {!loading && error && (
            <div className="text-sm text-destructive py-8 text-center">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No bookings recorded for this car
              {range !== "all" ? " in this period" : ""} yet.
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((e) => {
              const start = parseDbDate(e.earning_period_start);
              const end = parseDbDate(e.earning_period_end);
              const tripExpensesTotal = getTripExpensesTotal(e.trip_id, expenses);
              const net = getNetEarningAmount(Number(e.amount ?? 0), e.trip_id, expenses);
              const tripExpenses = e.trip_id
                ? expenses.filter((x) => x.trip_id === e.trip_id)
                : [];
              const isPaid = e.payment_status === "paid";
              const datePaid = parseDbDate((e as any).date_paid);
              const isOpen = expanded === e.id;

              return (
                <Collapsible
                  key={e.id}
                  open={isOpen}
                  onOpenChange={(o) => setExpanded(o ? e.id : null)}
                  className="rounded-xl border border-border bg-card"
                >
                  <CollapsibleTrigger className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-muted/40 transition-colors rounded-xl">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {e.guest_initials || "Guest"}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 px-1.5",
                            isPaid
                              ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                              : "border-amber-500/40 text-amber-600 bg-amber-500/10"
                          )}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </Badge>
                        {e.payment_source && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {e.payment_source}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {start ? format(start, "MMM d, yyyy") : "—"}
                        {" → "}
                        {end ? format(end, "MMM d, yyyy") : "—"}
                      </div>
                      {e.trip_id && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                          <Hash className="w-3 h-3" />
                          {e.trip_id}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-foreground">
                        {fmtMoney(Number(e.gross_earnings ?? e.amount ?? 0))}
                      </div>
                      <div className="text-[11px] text-muted-foreground">gross</div>
                      <div className="text-xs font-medium text-emerald-600 mt-1">
                        {fmtMoney(net)} net
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground inline-block mt-1 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 pt-0">
                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                      <Stat label="Gross" value={fmtMoney(Number(e.gross_earnings ?? e.amount ?? 0))} />
                      <Stat label="Trip expenses" value={fmtMoney(tripExpensesTotal)} />
                      <Stat label="Net" value={fmtMoney(net)} accent />
                      <Stat
                        label="Date paid"
                        value={datePaid ? format(datePaid, "MMM d, yyyy") : "—"}
                      />
                    </div>

                    {tripExpenses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/60">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Receipt className="w-3 h-3" />
                          Expense breakdown
                        </div>
                        <div className="space-y-1.5">
                          {tripExpenses.map((x) => {
                            const parts = [
                              x.amount && { label: x.expense_type || "Expense", v: Number(x.amount) },
                              x.toll_cost && { label: "Toll", v: Number(x.toll_cost) },
                              x.delivery_cost && { label: "Delivery", v: Number(x.delivery_cost) },
                              x.carwash_cost && { label: "Carwash", v: Number(x.carwash_cost) },
                              x.ev_charge_cost && { label: "EV charge", v: Number(x.ev_charge_cost) },
                            ].filter(Boolean) as { label: string; v: number }[];
                            return parts.map((p, i) => (
                              <div
                                key={`${x.id}-${i}`}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground">{p.label}</span>
                                <span className="font-medium text-foreground">
                                  {fmtMoney(p.v)}
                                </span>
                              </div>
                            ));
                          })}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SummaryChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 border",
        accent
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/40 border-border"
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-semibold",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-semibold",
          accent ? "text-emerald-600" : "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}
