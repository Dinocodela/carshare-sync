import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Settings,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Plus,
  Edit,
  Trash,
  Clock,
  Filter,
  X,
  MoreVertical,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader as SheetHead,
  SheetTitle as SheetTit,
  SheetDescription as SheetDesc,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useBookingValidation } from "@/hooks/useBookingValidation";
import { ConflictWarning } from "@/components/booking/ConflictWarning";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CarWithClient {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  location: string;
  mileage: number;
  color: string;
  description: string;
  vin_number: string | null;
  license_plate: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface Expense {
  id: string;
  host_id: string;
  car_id: string | null;
  trip_id?: string;
  guest_name?: string;
  expense_type: string;
  amount: number;
  ev_charge_cost?: number;
  carwash_cost?: number;
  delivery_cost?: number;
  toll_cost?: number;
  total_expenses?: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  receipt_urls?: string[];
  created_at: string;
  updated_at: string;
}

interface Earning {
  id: string;
  host_id: string;
  car_id: string;
  trip_id?: string;
  guest_name?: string;
  earning_type: string;
  amount: number;
  gross_earnings?: number;
  commission: number;
  net_amount: number;
  client_profit_percentage?: number;
  host_profit_percentage?: number;
  payment_source?: string;
  earning_period_start: string;
  earning_period_end: string;
  payment_status: string;
  payment_date: string | null;
  date_paid?: string;
  created_at: string;
  updated_at: string;
}

interface Claim {
  id: string;
  host_id: string;
  car_id: string;
  trip_id?: string;
  guest_name?: string;
  payment_source?: string;
  claim_type: string;
  incident_id?: string;
  description: string;
  claim_amount: number | null;
  incident_date: string;
  claim_status: string;
  claim_number: string | null;
  accident_description?: string;
  photos_taken?: boolean;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

type EarningsDateRange = "all" | "today" | "week" | "month";

type EarningsFilters = {
  carId: string; // 'all' or car id
  paymentSource: string; // 'all' | 'Turo' | ...
  paymentStatus: "all" | "paid" | "pending" | "processing" | "failed";
  dateRange: EarningsDateRange; // 👈 update
};

const VALID_TABS = [
  "active",
  "returns",
  "expenses",
  "earnings",
  "claims",
] as const;
type Tab = (typeof VALID_TABS)[number];

const tabFromHash = (hash: string): Tab => {
  const h = hash.replace("#", "") as string;
  return (VALID_TABS as readonly string[]).includes(h) ? (h as Tab) : "active";
};

const expenseSchema = z.object({
  trip_id: z.string().min(1, "Trip# is required"),
  car_id: z.string().optional(),
  guest_name: z.string().optional(),
  amount: z.number().min(0, "Amount must be 0 or greater").optional(),
  ev_charge_cost: z.number().min(0, "Cost must be 0 or greater").optional(),
  carwash_cost: z.number().min(0, "Cost must be 0 or greater").optional(),
  delivery_cost: z.number().min(0, "Cost must be 0 or greater").optional(),
  toll_cost: z.number().min(0, "Cost must be 0 or greater").optional(),
  description: z.string().optional(),
  expense_date: z.string().min(1, "Date is required"),
});

const earningSchema = z.object({
  car_id: z.string().min(1, "Car is required"),
  trip_id: z.string().min(1, "Trip# is required"),
  guest_name: z.string().min(1, "Guest name is required"),
  earning_type: z.string().min(1, "Earning type is required"),
  gross_earnings: z.number().min(0.01, "Amount must be greater than 0"),
  payment_source: z.string().min(1, "Payment source is required"),
  earning_period_start_date: z.string().min(1, "Start date is required"),
  earning_period_start_time: z.string().min(1, "Start time is required"),
  earning_period_end_date: z.string().min(1, "End date is required"),
  earning_period_end_time: z.string().min(1, "End time is required"),
  client_profit_percentage: z.number().min(0).max(100).default(70),
  host_profit_percentage: z.number().min(0).max(100).default(30),
  payment_status: z.string().min(1, "Payment status is required"),
  date_paid: z.string().optional(),
});

const claimSchema = z.object({
  car_id: z.string().min(1, "Car is required"),
  trip_id: z.string().optional(),
  guest_name: z.string().min(1, "Guest name is required"),
  payment_source: z.string().min(1, "Payment source is required"),
  claim_type: z.string().min(1, "Claim type is required"),
  incident_id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  accident_description: z
    .string()
    .min(1, "Detailed accident description is required"),
  claim_amount: z.number().min(0.01, "Amount must be greater than 0"),
  incident_date: z.string().min(1, "Incident date is required"),
  photos_taken: z.boolean().default(false),
  is_paid: z.boolean().default(false),
});
// Helper function to format car display name
const formatCarDisplayName = (car: CarWithClient) => {
  const model = car.model || "Unknown Model";
  const last5VIN = car.vin_number ? car.vin_number.slice(-5) : "N/A";
  const licensePlate = car.license_plate || "N/A";
  return `${model} - ${last5VIN} - ${licensePlate}`;
};

// Helper function to format detailed car info
const formatDetailedCarInfo = (car: CarWithClient) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
    <div>
      <span className="text-muted-foreground">Make:</span> {car.make || "N/A"}
    </div>
    <div>
      <span className="text-muted-foreground">Model:</span> {car.model || "N/A"}
    </div>
    <div>
      <span className="text-muted-foreground">Year:</span> {car.year || "N/A"}
    </div>
    <div>
      <span className="text-muted-foreground">Color:</span> {car.color || "N/A"}
    </div>
    <div>
      <span className="text-muted-foreground">License:</span>{" "}
      {car.license_plate || "N/A"}
    </div>
    <div>
      <span className="text-muted-foreground">VIN:</span>{" "}
      {car.vin_number || "N/A"}
    </div>
  </div>
);

export default function HostCarManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const isMobile = useIsMobile();
  const [cars, setCars] = useState<CarWithClient[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [earningDialogOpen, setEarningDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  // Edit state management
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingEarning, setEditingEarning] = useState<Earning | null>(null);
  const [selectedTripExpenses, setSelectedTripExpenses] = useState<number>(0);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);

  // Delete confirmation state
  const [deleteClaimId, setDeleteClaimId] = useState<string | null>(null);
  const [deleteClaimDialogOpen, setDeleteClaimDialogOpen] = useState(false);

  // Loading states for better UX
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // Mobile filters sheet state
  const [expenseFiltersOpen, setExpenseFiltersOpen] = useState(false);
  const [earningsFiltersOpen, setEarningsFiltersOpen] = useState(false);
  const [claimsFiltersOpen, setClaimsFiltersOpen] = useState(false);

  // Active tab state for conditional mobile UI
  const [tab, setTab] = useState<Tab>(() => tabFromHash(location.hash));

  // keep state in sync when hash changes (e.g., bottom nav links)
  useEffect(() => {
    setTab(tabFromHash(location.hash));
  }, [location.hash]);
  // Sync tab with URL hash (supports deep-linking, e.g., #returns)
  //   useEffect(() => {
  //     const fromHash = window.location.hash.replace("#", "");
  //     const valid = [
  //       "active",
  //       "returns",
  //       "expenses",
  //       "earnings",
  //       "claims",
  //     ] as const;
  //     if ((valid as readonly string[]).includes(fromHash)) {
  //       setTab(fromHash as typeof tab);
  //     }
  //     const onHashChange = () => {
  //       const h = window.location.hash.replace("#", "");
  //       if ((valid as readonly string[]).includes(h)) {
  //         setTab(h as typeof tab);
  //       }
  //     };
  //     window.addEventListener("hashchange", onHashChange);
  //     return () => window.removeEventListener("hashchange", onHashChange);
  //   }, []);

  // Filter state for expenses
  const [expenseFilters, setExpenseFilters] = useState({
    carId: "all",
    paymentSource: "all",
    dateRange: "all",
    tripSearch: "",
  });

  // Filter state for earnings
  const [earningsFilters, setEarningsFilters] = useState({
    carId: "all",
    paymentSource: "all",
    paymentStatus: "all",
    dateRange: "all",
    tripSearch: "",
  });

  // Filter state for claims
  const [claimsFilters, setClaimsFilters] = useState({
    carId: "all",
    claimStatus: "all",
    claimType: "all",
    dateRange: "all",
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
    },
  });

  const earningForm = useForm<z.infer<typeof earningSchema>>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      car_id: "",
      trip_id: "",
      guest_name: "",
      earning_type: "hosting",
      gross_earnings: 0,
      payment_source: "Turo",
      earning_period_start_date: new Date().toISOString().split("T")[0],
      earning_period_start_time: "09:00",
      earning_period_end_date: new Date().toISOString().split("T")[0],
      earning_period_end_time: "17:00",
      client_profit_percentage: 70,
      host_profit_percentage: 30,
      payment_status: "pending",
    },
  });

  // Add booking validation hook
  const { validateDateTimes, isValidating } = useBookingValidation();
  const [dateConflicts, setDateConflicts] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Auto-populate guest name and car when trip_id changes
  const watchedTripId = earningForm.watch("trip_id");

  useEffect(() => {
    if (watchedTripId && expenses.length > 0) {
      // Use setTimeout to ensure form state is ready
      const timer = setTimeout(() => {
        const expenseWithData = expenses.find(
          (expense) => expense.trip_id === watchedTripId
        );

        // Calculate total expenses for this trip
        const tripExpenses = expenses.filter(
          (expense) => expense.trip_id === watchedTripId
        );
        const totalExpenses = tripExpenses.reduce(
          (sum, expense) => sum + (expense.total_expenses || 0),
          0
        );
        setSelectedTripExpenses(totalExpenses);

        if (expenseWithData) {
          // Auto-populate guest name if available
          if (expenseWithData.guest_name) {
            earningForm.setValue("guest_name", expenseWithData.guest_name, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }

          // Auto-populate car if available
          if (expenseWithData.car_id) {
            earningForm.setValue("car_id", expenseWithData.car_id, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
            // Force form to re-render the car field
            earningForm.trigger("car_id");
          }
        } else if (watchedTripId) {
          // Clear fields if no matching expense found but still calculate expenses
          const tripExpenses = expenses.filter(
            (expense) => expense.trip_id === watchedTripId
          );
          const totalExpenses = tripExpenses.reduce(
            (sum, expense) => sum + (expense.total_expenses || 0),
            0
          );
          setSelectedTripExpenses(totalExpenses);

          earningForm.setValue("guest_name", "", { shouldValidate: true });
          earningForm.setValue("car_id", "", { shouldValidate: true });
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (watchedTripId && expenses.length === 0) {
    }
  }, [watchedTripId, expenses, earningForm]);

  const claimForm = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      car_id: "",
      claim_type: "",
      incident_id: "",
      trip_id: "",
      guest_name: "",
      payment_source: "Turo",
      description: "",
      claim_amount: 0,
      incident_date: new Date().toISOString().split("T")[0],
      photos_taken: false,
      is_paid: false,
    },
  });

  // Auto-populate guest name when trip_id changes in claims form
  const watchedClaimTripId = claimForm.watch("trip_id");

  useEffect(() => {
    if (watchedClaimTripId) {
      // Find the guest name from expenses first
      const expenseWithData = expenses.find(
        (expense) => expense.trip_id === watchedClaimTripId
      );

      // Then check earnings for both guest name and payment source
      const earningWithData = earnings.find(
        (earning) => earning.trip_id === watchedClaimTripId
      );

      // Auto-populate guest name (check both expenses and earnings)
      const guestName =
        expenseWithData?.guest_name || earningWithData?.guest_name;
      if (guestName) {
        claimForm.setValue("guest_name", guestName);
      }

      // Auto-populate payment source (only available in earnings)
      if (earningWithData?.payment_source) {
        claimForm.setValue("payment_source", earningWithData.payment_source);
      }
    }
  }, [watchedClaimTripId, expenses, earnings, claimForm]);

  // Add date validation for earning form
  const watchedCarId = earningForm.watch("car_id");
  const watchedStartDate = earningForm.watch("earning_period_start_date");
  const watchedStartTime = earningForm.watch("earning_period_start_time");
  const watchedEndDate = earningForm.watch("earning_period_end_date");
  const watchedEndTime = earningForm.watch("earning_period_end_time");

  useEffect(() => {
    const validateBookingDates = async () => {
      if (
        watchedCarId &&
        watchedStartDate &&
        watchedStartTime &&
        watchedEndDate &&
        watchedEndTime
      ) {
        const startDateTime = `${watchedStartDate}T${watchedStartTime}:00`;
        const endDateTime = `${watchedEndDate}T${watchedEndTime}:00`;
        const result = await validateDateTimes(
          watchedCarId,
          startDateTime,
          endDateTime,
          editingEarning?.id
        );
        setDateConflicts(result.conflicts);
      } else {
        setDateConflicts([]);
      }
    };

    const debounceTimer = setTimeout(validateBookingDates, 500);
    return () => clearTimeout(debounceTimer);
  }, [
    watchedCarId,
    watchedStartDate,
    watchedStartTime,
    watchedEndDate,
    watchedEndTime,
    validateDateTimes,
    editingEarning?.id,
  ]);

  // Auto-populate car and guest when trip_id changes in expenses form
  const watchedExpenseTripId = expenseForm.watch("trip_id");

  useEffect(() => {
    if (watchedExpenseTripId && expenses.length > 0) {
      // Find existing data for this trip
      const existingExpense = expenses.find(
        (expense) => expense.trip_id === watchedExpenseTripId
      );

      if (existingExpense) {
        // Auto-populate car if available
        if (existingExpense.car_id) {
          expenseForm.setValue("car_id", existingExpense.car_id, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        // Auto-populate guest name if available
        if (existingExpense.guest_name) {
          expenseForm.setValue("guest_name", existingExpense.guest_name, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
  }, [watchedExpenseTripId, expenses, expenseForm]);

  // Auto-populate trip ID when car is selected in claims form
  const watchedClaimCarId = claimForm.watch("car_id");

  useEffect(() => {
    if (watchedClaimCarId && !editingClaim && !loading) {
      // Find expenses for this car with trip IDs
      const carExpenses = expenses
        .filter((expense) => {
          const hasCarMatch = expense.car_id === watchedClaimCarId;
          const hasTripId = expense.trip_id && expense.trip_id.trim() !== "";
          return hasCarMatch && hasTripId;
        })
        .sort(
          (a, b) =>
            new Date(b.expense_date).getTime() -
            new Date(a.expense_date).getTime()
        );

      if (carExpenses.length > 0 && carExpenses[0].trip_id) {
        claimForm.setValue("trip_id", carExpenses[0].trip_id, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
      }
    }
  }, [watchedClaimCarId, expenses, claimForm, editingClaim, loading]);

  // Filtered expenses based on current filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Filter by trip search
    if (expenseFilters.tripSearch && expenseFilters.tripSearch.trim() !== "") {
      const searchTerm = expenseFilters.tripSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (expense) => expense.trip_id?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by car
    if (expenseFilters.carId && expenseFilters.carId !== "all") {
      filtered = filtered.filter(
        (expense) => expense.car_id === expenseFilters.carId
      );
    }

    // Filter by payment source (via earnings with matching trip_id)
    if (
      expenseFilters.paymentSource &&
      expenseFilters.paymentSource !== "all"
    ) {
      const matchingTripIds = earnings
        .filter(
          (earning) => earning.payment_source === expenseFilters.paymentSource
        )
        .map((earning) => earning.trip_id)
        .filter(Boolean);

      filtered = filtered.filter(
        (expense) =>
          expense.trip_id && matchingTripIds.includes(expense.trip_id)
      );
    }

    // Filter by date range
    if (expenseFilters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.expense_date);

        switch (expenseFilters.dateRange) {
          case "today":
            return expenseDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return expenseDate >= weekAgo;
          case "month":
            const monthAgo = new Date(
              today.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            return expenseDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
  }, [expenses, earnings, expenseFilters]);

  // Clear all filters
  const clearFilters = () => {
    setExpenseFilters({
      carId: "all",
      paymentSource: "all",
      dateRange: "all",
      tripSearch: "",
    });
  };

  const clearEarningsFilters = () => {
    setEarningsFilters({
      carId: "all",
      paymentSource: "all",
      paymentStatus: "all",
      dateRange: "all",
      tripSearch: "",
    });
  };

  const clearClaimsFilters = () => {
    setClaimsFilters({
      carId: "all",
      claimStatus: "all",
      claimType: "all",
      dateRange: "all",
    });
  };

  // Filtered earnings based on filters
  const filteredEarnings = useMemo(() => {
    let filtered = [...earnings];

    // Filter by trip search
    if (earningsFilters.tripSearch && earningsFilters.tripSearch.trim() !== "") {
      const searchTerm = earningsFilters.tripSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (earning) => earning.trip_id?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by car
    if (earningsFilters.carId && earningsFilters.carId !== "all") {
      filtered = filtered.filter(
        (earning) => earning.car_id === earningsFilters.carId
      );
    }

    // Filter by payment source
    if (
      earningsFilters.paymentSource &&
      earningsFilters.paymentSource !== "all"
    ) {
      filtered = filtered.filter(
        (earning) => earning.payment_source === earningsFilters.paymentSource
      );
    }

    // Filter by payment status
    if (
      earningsFilters.paymentStatus &&
      earningsFilters.paymentStatus !== "all"
    ) {
      filtered = filtered.filter(
        (earning) => earning.payment_status === earningsFilters.paymentStatus
      );
    }

    // Filter by date range
    if (earningsFilters.dateRange !== "all") {
      const today = new Date();
      const filterDate = new Date();

      switch (earningsFilters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((earning) => {
            const earningDate = new Date(earning.earning_period_start);
            earningDate.setHours(0, 0, 0, 0);
            return earningDate.getTime() === filterDate.getTime();
          });
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (earning) => new Date(earning.earning_period_start) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(
            (earning) => new Date(earning.earning_period_start) >= filterDate
          );
          break;
      }
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.earning_period_start).getTime() - new Date(a.earning_period_start).getTime()
    );
  }, [earnings, earningsFilters]);

  // Filtered claims based on filters
  const filteredClaims = useMemo(() => {
    let filtered = [...claims];

    // Filter by car
    if (claimsFilters.carId && claimsFilters.carId !== "all") {
      filtered = filtered.filter(
        (claim) => claim.car_id === claimsFilters.carId
      );
    }

    // Filter by claim status
    if (claimsFilters.claimStatus && claimsFilters.claimStatus !== "all") {
      filtered = filtered.filter(
        (claim) => claim.claim_status === claimsFilters.claimStatus
      );
    }

    // Filter by claim type
    if (claimsFilters.claimType && claimsFilters.claimType !== "all") {
      filtered = filtered.filter(
        (claim) => claim.claim_type === claimsFilters.claimType
      );
    }

    // Filter by date range
    if (claimsFilters.dateRange !== "all") {
      const today = new Date();
      const filterDate = new Date();

      switch (claimsFilters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((claim) => {
            const claimDate = new Date(claim.incident_date);
            claimDate.setHours(0, 0, 0, 0);
            return claimDate.getTime() === filterDate.getTime();
          });
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (claim) => new Date(claim.incident_date) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(
            (claim) => new Date(claim.incident_date) >= filterDate
          );
          break;
      }
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [claims, claimsFilters]);

  // Get distinct claim types from claims data
  const distinctClaimTypes = useMemo(() => {
    const types = [...new Set(claims.map((c) => c.claim_type).filter(Boolean))];
    return types.sort();
  }, [claims]);

  // Count active filters
  const activeFiltersCount = Object.values(expenseFilters).filter(
    (value) => value && value !== "all"
  ).length;
  const activeEarningsFiltersCount = Object.values(earningsFilters).filter(
    (value) => value && value !== "all"
  ).length;
  const activeClaimsFiltersCount = Object.values(claimsFilters).filter(
    (value) => value && value !== "all"
  ).length;

  useEffect(() => {
    if (user) {
      fetchHostedCars();
      fetchExpenses(true);
      fetchEarnings();
      fetchClaims();
    }
  }, [user]);
  const fetchHostedCars = async () => {
    if (!user) return;
    try {
      const { data: carsData, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .eq("host_id", user.id)
        .in("status", ["hosted", "ready_for_return"])
        .order("updated_at", {
          ascending: false,
        });
      if (carsError) throw carsError;
      if (!carsData || carsData.length === 0) {
        setCars([]);
        return;
      }

      // Get unique client IDs
      const clientIds = [
        ...new Set(carsData.map((car) => car.client_id).filter(Boolean)),
      ];

      // Fetch client profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, phone")
        .in("user_id", clientIds);
      if (profilesError) throw profilesError;

      // Map cars with client information
      const transformedCars = carsData.map((car) => {
        const clientProfile = profilesData?.find(
          (profile) => profile.user_id === car.client_id
        );
        return {
          ...car,
          client: clientProfile
            ? {
                id: clientProfile.user_id,
                first_name: clientProfile.first_name,
                last_name: clientProfile.last_name,
                phone: clientProfile.phone,
              }
            : {
                id: car.client_id || "unknown",
                first_name: "Unknown",
                last_name: "Client",
                phone: "N/A",
              },
        };
      });
      setCars(transformedCars as CarWithClient[]);
    } catch (error) {
      console.error("Error fetching hosted cars:", error);
      toast({
        title: "Error loading cars",
        description: "Unable to load hosted cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCarReturn = async (carId: string) => {
    try {
      // First, update just the status to 'available'
      const { error: statusError } = await supabase
        .from("cars")
        .update({
          status: "available",
        })
        .eq("id", carId);
      if (statusError) throw statusError;

      // Then, clear the host and client associations
      const { error: clearError } = await supabase
        .from("cars")
        .update({
          host_id: null,
          client_id: null,
        })
        .eq("id", carId);
      if (clearError) throw clearError;
      toast({
        title: "Car returned successfully",
        description:
          "The car has been marked as returned and is now available for new requests.",
      });

      // Refresh the list
      fetchHostedCars();
    } catch (error) {
      console.error("Error returning car:", error);
      toast({
        title: "Error",
        description: "Unable to process car return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchExpenses = async (showLoading = false) => {
    if (!user) {
      return;
    }

    try {
      if (showLoading) setExpensesLoading(true);

      const { data, error } = await supabase
        .from("host_expenses")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error loading expenses",
        description: "Unable to load expenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setExpensesLoading(false);
    }
  };

  const fetchEarnings = async (showLoading = false) => {
    if (!user) return;

    try {
      if (showLoading) setEarningsLoading(true);

      const { data, error } = await (supabase as any)
        .from("host_earnings")
        .select("*")
        .eq("host_id", user.id)
        .order("earning_period_start", { ascending: false });

      if (error) throw error;

      setEarnings(data || []);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      if (showLoading) setEarningsLoading(false);
    }
  };

  const fetchClaims = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("host_claims")
        .select("*")
        .eq("host_id", user.id)
        .order("incident_date", { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };

  const onExpenseSubmit = async (values: any) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to manage expenses.",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { session: currentSession },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !currentSession) {
      toast({
        title: "Session Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const expenseData = {
        host_id: currentSession.user.id,
        trip_id: values.trip_id,
        car_id: values.car_id || null,
        guest_name: values.guest_name || null,
        expense_type: "general",
        amount: values.amount || 0,
        ev_charge_cost: values.ev_charge_cost || 0,
        carwash_cost: values.carwash_cost || 0,
        delivery_cost: values.delivery_cost || 0,
        toll_cost: values.toll_cost || 0,
        description: values.description || null,
        expense_date: values.expense_date,
      };

      if (editingExpense) {
        // Update existing expense
        const { error } = await supabase
          .from("host_expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);

        if (error) throw error;

        toast({
          title: "Expense updated successfully",
          description: "Your expense has been updated.",
        });
      } else {
        // Create new expense
        const { error } = await supabase
          .from("host_expenses")
          .insert(expenseData);

        if (error) throw error;

        toast({
          title: "Expense added successfully",
          description: "Your expense has been recorded.",
        });
      }

      // Sync guest name across earnings and expenses for the same trip
      if (values.trip_id && values.guest_name) {
        try {
          // Update earnings with the same trip_id to sync guest names
          const { error: syncError } = await (supabase as any)
            .from("host_earnings")
            .update({ guest_name: values.guest_name })
            .eq("trip_id", values.trip_id)
            .eq("host_id", currentSession.user.id);

          if (syncError) console.error("Sync error:", syncError);
        } catch (syncError) {
          console.error("Error syncing trip data:", syncError);
        }
      }

      setExpenseDialogOpen(false);
      setEditingExpense(null);
      expenseForm.reset();
      fetchExpenses();
      fetchEarnings(); // Refresh earnings to sync guest names and trip data
    } catch (error) {
      console.error("Error managing expense:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Error",
        description: `Failed to ${
          editingExpense ? "update" : "add"
        } expense: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const onDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("host_expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;

      toast({
        title: "Expense deleted successfully",
        description: "The expense has been removed.",
      });

      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDeleteEarning = async (earningId: string) => {
    try {
      const { error } = await supabase
        .from("host_earnings")
        .delete()
        .eq("id", earningId);

      if (error) throw error;

      toast({
        title: "Earning deleted successfully",
        description: "The earning has been removed.",
      });

      fetchEarnings();
    } catch (error) {
      console.error("Error deleting earning:", error);
      toast({
        title: "Error",
        description: "Failed to delete earning. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    expenseForm.reset({
      trip_id: expense.trip_id || "",
      car_id: expense.car_id || "",
      guest_name: expense.guest_name || "",
      amount: expense.amount,
      ev_charge_cost: expense.ev_charge_cost || 0,
      carwash_cost: expense.carwash_cost || 0,
      delivery_cost: expense.delivery_cost || 0,
      toll_cost: expense.toll_cost || 0,
      description: expense.description || "",
      expense_date: expense.expense_date,
    });
    setExpenseDialogOpen(true);
  };

  const onEarningSubmit = async (values: any) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to manage earnings.",
        variant: "destructive",
      });
      return;
    }

    // Validate dates before submission
    const startDateTimeLocal = `${values.earning_period_start_date}T${values.earning_period_start_time}:00`;
    const endDateTimeLocal = `${values.earning_period_end_date}T${values.earning_period_end_time}:00`;
    const startDateTime = new Date(startDateTimeLocal).toISOString();
    const endDateTime = new Date(endDateTimeLocal).toISOString();
    const validationResult = await validateDateTimes(
      values.car_id,
      startDateTime,
      endDateTime,
      editingEarning?.id
    );

    if (!validationResult.isValid) {
      toast({
        title: validationResult.error ? "Validation error" : "Date conflict",
        description:
          validationResult.error ??
          "This car is already booked during the selected period. Please choose different dates.",
        variant: "destructive",
      });
      setDateConflicts(validationResult.conflicts || []);
      setShowCalendar(true);
      return;
    }

    const {
      data: { session: currentSession },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !currentSession) {
      toast({
        title: "Session Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const grossEarnings = Number(values.gross_earnings);

      // Calculate net earnings by deducting expenses for this trip
      const netEarnings = grossEarnings - selectedTripExpenses;

      // Apply profit split to NET earnings (after expenses)
      const clientProfit =
        (netEarnings * Number(values.client_profit_percentage)) / 100;
      const hostProfit =
        (netEarnings * Number(values.host_profit_percentage)) / 100;

      const earningData = {
        host_id: currentSession.user.id,
        car_id: values.car_id,
        trip_id: values.trip_id,
        guest_name: values.guest_name,
        earning_type: values.earning_type,
        amount: grossEarnings,
        gross_earnings: grossEarnings,
        commission: 0,
        net_amount: clientProfit,
        client_profit_percentage: Number(values.client_profit_percentage),
        host_profit_percentage: Number(values.host_profit_percentage),
        payment_source: values.payment_source,
        earning_period_start: startDateTime,
        earning_period_end: endDateTime,
        payment_status: values.payment_status,
        date_paid: values.date_paid || null,
      };

      if (editingEarning) {
        const wasPaidBefore = editingEarning.payment_status === "paid";

        // Update existing earning
        const { error, data: updated } = await supabase
          .from("host_earnings")
          .update(earningData)
          .eq("id", editingEarning.id)
          .select("id, payment_status")
          .maybeSingle();

        if (error) throw error;

        toast({
          title: "Earning updated successfully",
          description: "Your earning has been updated.",
        });

        if (values.payment_status === "paid" && !wasPaidBefore) {
          try {
            const { error: notifyError } = await supabase.functions.invoke(
              "send-client-commission-paid",
              {
                body: { earningId: editingEarning.id },
              }
            );
            if (notifyError) {
              console.error("Commission email failed:", notifyError);
              toast({
                title: "Notification failed",
                description: "Payment saved, but email to client failed.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Client notified",
                description: "Commission payment email sent.",
              });
            }
          } catch (e) {
            console.error("Commission email exception:", e);
          }
        }
      } else {
        // Create new earning
        const { error, data: inserted } = await supabase
          .from("host_earnings")
          .insert(earningData)
          .select("id, payment_status")
          .maybeSingle();

        if (error) throw error;

        toast({
          title: "Earning recorded successfully",
          description: "Your earning has been added to the system.",
        });

        if (inserted?.payment_status === "paid" && inserted?.id) {
          try {
            const { error: notifyError } = await supabase.functions.invoke(
              "send-client-commission-paid",
              {
                body: { earningId: inserted.id },
              }
            );
            if (notifyError) {
              console.error("Commission email failed:", notifyError);
              toast({
                title: "Notification failed",
                description: "Payment saved, but email to client failed.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Client notified",
                description: "Commission payment email sent.",
              });
            }
          } catch (e) {
            console.error("Commission email exception:", e);
          }
        }
      }

      // Sync guest name across earnings and expenses for the same trip
      if (values.trip_id && values.guest_name) {
        try {
          // Update expenses with the same trip_id to sync guest names
          const { error: syncError } = await (supabase as any)
            .from("host_expenses")
            .update({ guest_name: values.guest_name })
            .eq("trip_id", values.trip_id)
            .eq("host_id", currentSession.user.id);

          if (syncError) console.error("Sync error:", syncError);
        } catch (syncError) {
          console.error("Error syncing trip data:", syncError);
        }
      }

      setEarningDialogOpen(false);
      setEditingEarning(null);
      earningForm.reset();

      // Add a small delay and force refresh with loading states
      setTimeout(async () => {
        await Promise.all([fetchEarnings(true), fetchExpenses(true)]);
      }, 300);
    } catch (error) {
      console.error("Error managing earning:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Error",
        description: `Failed to ${
          editingEarning ? "update" : "add"
        } earning: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleAddEarningClick = () => {
    setEditingEarning(null);
    earningForm.reset({
      car_id: "",
      trip_id: "",
      guest_name: "",
      earning_type: "hosting",
      gross_earnings: 0,
      payment_source: "Turo",
      earning_period_start_date: "",
      earning_period_start_time: "",
      earning_period_end_date: "",
      earning_period_end_time: "",
      client_profit_percentage: 70,
      host_profit_percentage: 30,
      payment_status: "pending",
      date_paid: "",
    });
    setEarningDialogOpen(true);
  };

  const handleEditEarning = (earning: Earning) => {
    setEditingEarning(earning);
    earningForm.reset({
      car_id: earning.car_id,
      trip_id: earning.trip_id || "",
      guest_name: earning.guest_name || "",
      earning_type: earning.earning_type,
      gross_earnings: earning.gross_earnings || 0,
      payment_source: earning.payment_source || "Turo",
      earning_period_start_date: earning.earning_period_start.split("T")[0],
      earning_period_start_time:
        earning.earning_period_start.split("T")[1]?.slice(0, 5) || "",
      earning_period_end_date: earning.earning_period_end.split("T")[0],
      earning_period_end_time:
        earning.earning_period_end.split("T")[1]?.slice(0, 5) || "",
      client_profit_percentage: earning.client_profit_percentage || 70,
      host_profit_percentage: earning.host_profit_percentage || 30,
      payment_status: earning.payment_status,
      date_paid: earning.date_paid || "",
    });
    setEarningDialogOpen(true);
  };

  const onClaimSubmit = async (values: z.infer<typeof claimSchema>) => {
    if (!user) return;

    try {
      const claimData = {
        host_id: user.id,
        car_id: values.car_id,
        trip_id: values.trip_id,
        guest_name: values.guest_name || null,
        payment_source: values.payment_source || null,
        claim_type: values.claim_type,
        incident_id: values.incident_id || null,
        description: values.description,
        accident_description: values.accident_description || null,
        claim_amount: values.claim_amount,
        incident_date: values.incident_date,
        photos_taken: values.photos_taken,
        is_paid: values.is_paid,
      };

      if (editingClaim) {
        // Update existing claim
        const { error } = await supabase
          .from("host_claims")
          .update(claimData)
          .eq("id", editingClaim.id);

        if (error) throw error;

        toast({
          title: "Claim updated successfully",
          description: "Your claim has been updated.",
        });
      } else {
        // Create new claim
        const { error } = await supabase.from("host_claims").insert(claimData);

        if (error) throw error;

        toast({
          title: "Claim submitted successfully",
          description: "Your claim has been filed for review.",
        });
      }

      setClaimDialogOpen(false);
      setEditingClaim(null);
      claimForm.reset();
      fetchClaims();
    } catch (error) {
      console.error("Error managing claim:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          editingClaim ? "update" : "submit"
        } claim. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim);
    claimForm.reset({
      car_id: claim.car_id,
      trip_id: claim.trip_id || "",
      guest_name: claim.guest_name || "",
      payment_source: claim.payment_source || "Turo",
      claim_type: claim.claim_type,
      incident_id: claim.incident_id || "",
      description: claim.description,
      accident_description: claim.accident_description || "",
      claim_amount: claim.claim_amount || 0,
      incident_date: claim.incident_date,
      photos_taken: claim.photos_taken || false,
      is_paid: claim.is_paid || false,
    });
    setClaimDialogOpen(true);
  };

  const handleDeleteClaim = async () => {
    if (!deleteClaimId) return;

    try {
      const { error } = await supabase
        .from("host_claims")
        .delete()
        .eq("id", deleteClaimId)
        .eq("host_id", user?.id);

      if (error) throw error;

      // Update local state
      setClaims((prev) => prev.filter((claim) => claim.id !== deleteClaimId));

      toast({
        title: "Success",
        description: "Claim deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting claim:", error);
      toast({
        title: "Error",
        description: "Failed to delete claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteClaimId(null);
      setDeleteClaimDialogOpen(false);
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    newStatus: string
  ) => {
    try {
      const updateData: any = {
        claim_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set approval_date when status becomes approved
      if (newStatus === "approved") {
        updateData.approval_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("host_claims")
        .update(updateData)
        .eq("id", claimId);

      if (error) throw error;

      // Refresh the claims data
      fetchClaims();

      toast({
        title: "Status Updated",
        description: `Claim status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating claim status:", error);
      toast({
        title: "Error",
        description: "Failed to update claim status.",
        variant: "destructive",
      });
    }
  };
  const handleManagementAction = (action: string, car: CarWithClient) => {
    switch (action) {
      case "view-details":
        navigate(`/cars/${car.id}/view`);
        break;
      case "schedule-maintenance":
        navigate(`/cars/${car.id}/schedule-maintenance`);
        break;
      case "report-issue":
        toast({
          title: "Report Issue",
          description: "Issue reporting feature coming soon!",
        });
        break;
      case "message-client":
        toast({
          title: "Message Client",
          description: "Messaging feature coming soon!",
        });
        break;
      case "full-details":
        // Only navigate if the route exists
        navigate(`/car-details/${car.id}`);
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: "This feature will be available soon!",
        });
    }
  };

  const onTabChange = (next: string) => {
    if ((VALID_TABS as readonly string[]).includes(next)) {
      setTab(next as Tab);
      navigate({ hash: `#${next}` }, { replace: true });
    }
  };

  const [earningFiltersOpen, setEarningFiltersOpen] = useState(false);

  const earningsActiveFiltersCount =
    Number(earningsFilters.carId !== "all") +
    Number(earningsFilters.paymentSource !== "all") +
    Number(earningsFilters.paymentStatus !== "all") +
    Number(earningsFilters.dateRange !== "all") +
    Number(earningsFilters.tripSearch.trim() !== "");

  const activeHostedCars = cars.filter((car) => car.status === "hosted");
  const readyForReturnCars = cars.filter(
    (car) => car.status === "ready_for_return"
  );
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">
            Loading hosted cars...
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <>
        <header className="z-10 flex items-center justify-center gap-2 py-2 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Hosted</h1>
          </div>
        </header>

        <SEO
          title="Host Car Management"
          description="Manage hosted cars, returns, expenses, earnings, and claims."
        />
        <PageContainer className="pb-24">
          <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            {/* Tabs header */}
            {/* Sticky header */}
            {/* Header that matches the bottom bar */}
            <div
              className="
   z-40 border-b
  backdrop-blur-md bg-white/70 supports-[backdrop-filter]:bg-white/60
  shadow-[0_6px_16px_rgba(0,0,0,0.05)]
"
            >
              <TabsList className="grid grid-cols-4 w-full h-11 px-1.5 gap-0 bg-transparent border-0">
                {[
                  {
                    key: "active",
                    label: "Active",
                    count: activeHostedCars.length,
                  },
                  {
                    key: "expenses",
                    label: "Expenses",
                    count: expenses.length,
                  },
                  {
                    key: "earnings",
                    label: "Earnings",
                    count: earnings.length,
                  },
                  { key: "claims", label: "Claims", count: claims.length },
                ].map(({ key, label, count }) => (
                  <TabsTrigger
                    key={key}
                    value={key as any}
                    className="
          group relative inline-flex items-center justify-center
          h-11 px-3 rounded-none text-[15px] font-medium
          text-muted-foreground data-[state=active]:text-primary
          transition-colors
        "
                  >
                    {/* label (kept perfectly centered) */}
                    <span className="leading-none">{label}</span>

                    {/* badge - lowered & tighter, with a subtle ring like iOS badges */}
                    {!!count && (
                      <span
                        className="
              pointer-events-none absolute top-[0px] right-[0px]
              inline-grid place-items-center tabular-nums
              h-[18px] min-w-[18px] 
              rounded-full text-[10px] leading-none
              bg-muted/90 text-foreground/70 ring-1 ring-black/5
              group-data-[state=active]:bg-primary/10
              group-data-[state=active]:text-primary
            "
                      >
                        {count}
                      </span>
                    )}

                    {/* active underline */}
                    <span
                      aria-hidden
                      className="
            absolute left-2 right-2 -bottom-[1px] h-[2px] rounded-full
            bg-primary opacity-0 group-data-[state=active]:opacity-100
          "
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="active" className="space-y-4  sm:px-0">
              {activeHostedCars.length === 0 ? (
                <Card className="w-full mx-0 max-w-none">
                  <CardContent className="text-center p-4 sm:p-6">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No cars currently hosted
                    </h3>
                    <p className="text-muted-foreground">
                      Cars you're hosting will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion
                  /* multiple so desktop can keep several open; mobile starts collapsed */
                  type="multiple"
                  defaultValue={
                    !isMobile ? activeHostedCars.map((c) => c.id) : []
                  }
                  className="grid gap-3 md:gap-4 md:grid-cols-2"
                >
                  {activeHostedCars.map((car) => (
                    <AccordionItem
                      key={car.id}
                      value={car.id}
                      className="border-none group"
                    >
                      <Card className="w-full mx-0 max-w-none">
                        {/* Header becomes the accordion trigger */}
                        <CardHeader className="p-3 sm:p-4 md:p-6 items-center">
                          <AccordionTrigger
                            className="
                  group w-full rounded-md px-0
                  [&[data-state=open]_.chev]:rotate-180
                  hover:no-underline
                "
                          >
                            <div className="flex w-full items-start justify-between gap-3">
                              <div className="min-w-0">
                                <CardTitle className="text-sm sm:text-lg break-words">
                                  {formatCarDisplayName(car)}
                                </CardTitle>
                                <CardDescription className="break-words">
                                  Location: {car.location}
                                </CardDescription>
                                <Badge className="mt-2" variant="default">
                                  Hosting
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          {/* Header actions: visible ONLY when collapsed */}
                          <div className="mt-3 flex flex-col sm:flex-row gap-2 group-data-[state=open]:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() =>
                                window.open(`tel:${car.client.phone}`)
                              }
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call Client
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Manage
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleManagementAction("view-details", car)
                                  }
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Car Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleManagementAction(
                                      "schedule-maintenance",
                                      car
                                    )
                                  }
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Maintenance
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        {/* Body */}
                        <AccordionContent>
                          <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
                            {/* Car information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Color:
                                </span>
                                <p className="font-medium">
                                  {car.color || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Mileage:
                                </span>
                                <p className="font-medium">
                                  {car.mileage
                                    ? `${car.mileage.toLocaleString()} mi`
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Hosting Since:
                                </span>
                                <p className="font-medium">
                                  {new Date(
                                    car.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Status:
                                </span>
                                <p className="font-medium text-green-600">
                                  Active
                                </p>
                              </div>
                            </div>

                            {/* Client Contact */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">
                                Client Contact
                              </h4>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <strong>Name:</strong>{" "}
                                  {car.client.first_name || car.client.last_name
                                    ? `${car.client.first_name || ""} ${
                                        car.client.last_name || ""
                                      }`.trim()
                                    : "Name not available"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <a
                                    href={`tel:${car.client.phone}`}
                                    className="text-sm hover:underline"
                                  >
                                    {car.client.phone}
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() =>
                                  window.open(`tel:${car.client.phone}`)
                                }
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Call Client
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                  >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleManagementAction(
                                        "view-details",
                                        car
                                      )
                                    }
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Car Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleManagementAction(
                                        "schedule-maintenance",
                                        car
                                      )
                                    }
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Maintenance
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="returns" className="space-y-4  sm:px-0">
              {readyForReturnCars.length === 0 ? (
                <Card className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-none">
                  <CardContent className="text-center p-4 sm:p-6">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No cars ready for return
                    </h3>
                    <p className="text-muted-foreground">
                      Cars ready to be returned will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={
                    !isMobile ? readyForReturnCars[0]?.id : undefined
                  }
                  className="grid gap-4 md:grid-cols-2"
                >
                  {readyForReturnCars.map((car) => (
                    <AccordionItem
                      key={car.id}
                      value={car.id}
                      className="border-none group" // 👈 enables data-state targeting
                    >
                      <Card className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-none border-orange-200">
                        {/* Header (trigger) */}
                        <AccordionTrigger className="w-full p-3 sm:p-4 md:p-6 hover:no-underline">
                          <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap w-full">
                            <div>
                              <CardTitle className="text-sm sm:text-lg break-words">
                                {formatCarDisplayName(car)}
                              </CardTitle>
                              <CardDescription className="break-words">
                                Location: {car.location}
                              </CardDescription>
                            </div>
                            <Badge
                              className="w-full sm:w-auto flex items-center justify-center"
                              variant="secondary"
                            >
                              Ready for Return
                            </Badge>
                          </div>
                        </AccordionTrigger>

                        {/* Header actions — visible only when COLLAPSED */}
                        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 -mt-2 group-data-[state=open]:hidden">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() =>
                                window.open(`tel:${car.client.phone}`)
                              }
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call Client
                            </Button>
                            <Button
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleCarReturn(car.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Return
                            </Button>
                          </div>
                        </div>

                        {/* Body (expanded) */}
                        <AccordionContent>
                          <CardContent className="p-3 sm:p-4 space-y-4">
                            <div className="space-y-2">
                              <p className="text-sm text-orange-600 font-medium">
                                ⚠ Client has requested car return
                              </p>

                              {/* Client Contact */}
                              <div>
                                <h4 className="font-medium mb-2">
                                  Client Contact
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <strong>Name:</strong>{" "}
                                    {car.client.first_name ||
                                    car.client.last_name
                                      ? `${car.client.first_name || ""} ${
                                          car.client.last_name || ""
                                        }`.trim()
                                      : "Name not available"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a
                                      href={`tel:${car.client.phone}`}
                                      className="text-sm hover:underline"
                                    >
                                      {car.client.phone}
                                    </a>
                                  </div>
                                </div>
                              </div>

                              {/* Actions (expanded) */}
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() =>
                                    window.open(`tel:${car.client.phone}`)
                                  }
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call Client
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => handleCarReturn(car.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Return
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4  sm:px-0">
              <div className="flex justify-between items-center ">
                {/* <h3 className="text-lg font-medium">Expenses</h3> */}
                {isMobile ? (
                  <>
                    {/* Top row: + Expense (left)  |  Filters + Clear (right) */}
                    <div className="flex w-full items-center justify-between">
                      <Button
                        size="sm"
                        onClick={() => setExpenseDialogOpen(true)}
                        className="h-8 px-3 font-medium justify-center"
                        aria-label="Add expense"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Expense
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpenseFiltersOpen(true)}
                          className="h-8 px-3"
                          aria-label="Open filters"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </Button>

                        {activeFiltersCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            aria-label="Clear filters"
                          >
                            <X className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">Clear</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Add/Edit Expense bottom sheet (unchanged) */}
                    <Sheet
                      open={expenseDialogOpen}
                      onOpenChange={setExpenseDialogOpen}
                    >
                      <SheetContent
                        side="bottom"
                        className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
                      >
                        <SheetHead>
                          <SheetTit>
                            {editingExpense
                              ? "Edit Expense"
                              : "Add New Expense"}
                          </SheetTit>
                          <SheetDesc>
                            {editingExpense
                              ? "Update your expense details."
                              : "Record a new hosting-related expense."}
                          </SheetDesc>
                        </SheetHead>
                        <Form {...expenseForm}>
                          <form
                            onSubmit={expenseForm.handleSubmit(onExpenseSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={expenseForm.control}
                              name="trip_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Trip# *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter Trip ID"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="car_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Car
                                    {field.value && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        Auto-filled
                                      </Badge>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a car (optional)" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {cars.map((car) => (
                                        <SelectItem key={car.id} value={car.id}>
                                          {formatCarDisplayName(car)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="guest_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Guest Name
                                    {field.value && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        Auto-filled
                                      </Badge>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter guest name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-4">
                              <h4 className="font-medium">Cost Breakdown</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={expenseForm.control}
                                  name="ev_charge_cost"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>EV Charge Cost</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={expenseForm.control}
                                  name="carwash_cost"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Carwash Cost</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={expenseForm.control}
                                  name="delivery_cost"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Delivery Cost</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={expenseForm.control}
                                  name="toll_cost"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Toll Cost</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={expenseForm.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Other Expenses</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={expenseForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the expense..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="expense_date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="pt-2 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setExpenseDialogOpen(false);
                                  setEditingExpense(null);
                                  expenseForm.reset();
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">
                                {editingExpense
                                  ? "Update Expense"
                                  : "Add Expense"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </SheetContent>
                    </Sheet>

                    {/* Filters bottom sheet (keeps Clear inside header too) */}
                    <Sheet
                      open={expenseFiltersOpen}
                      onOpenChange={setExpenseFiltersOpen}
                    >
                      <SheetContent
                        side="bottom"
                        className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto text-base" // normalize base size
                      >
                        <SheetHead>
                          <SheetTit>Expense Filters</SheetTit>
                          <SheetDesc>Refine the list of expenses.</SheetDesc>
                        </SheetHead>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Filters
                              </span>
                              {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {activeFiltersCount} active
                                </Badge>
                              )}
                            </div>
                            {activeFiltersCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Search by Trip#</Label>
                              <Input
                                placeholder="Enter trip number..."
                                value={expenseFilters.tripSearch}
                                onChange={(e) =>
                                  setExpenseFilters((prev) => ({
                                    ...prev,
                                    tripSearch: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Car</Label>
                              <Select
                                value={expenseFilters.carId}
                                onValueChange={(value) =>
                                  setExpenseFilters((prev) => ({
                                    ...prev,
                                    carId: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All cars" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All cars</SelectItem>
                                  {cars.map((car) => (
                                    <SelectItem key={car.id} value={car.id}>
                                      {formatCarDisplayName(car)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Payment Source
                              </Label>
                              <Select
                                value={expenseFilters.paymentSource}
                                onValueChange={(value) =>
                                  setExpenseFilters((prev) => ({
                                    ...prev,
                                    paymentSource: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All sources" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All sources
                                  </SelectItem>
                                  <SelectItem value="Turo">Turo</SelectItem>
                                  <SelectItem value="Eon">Eon</SelectItem>
                                  <SelectItem value="GetAround">
                                    GetAround
                                  </SelectItem>
                                  <SelectItem value="Private">
                                    Private
                                  </SelectItem>
                                  <SelectItem value="Insurance">
                                    Insurance
                                  </SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Added Recently
                              </Label>
                              <RadioGroup
                                value={expenseFilters.dateRange}
                                onValueChange={(value) =>
                                  setExpenseFilters((prev) => ({
                                    ...prev,
                                    dateRange: value,
                                  }))
                                }
                                className="flex flex-wrap gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="all"
                                    id="m-all"
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="m-all" className="text-sm">
                                    All
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="today" id="m-today" />
                                  <Label htmlFor="m-today" className="text-sm">
                                    Today
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="week" id="m-week" />
                                  <Label htmlFor="m-week" className="text-sm">
                                    This Week
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="month" id="m-month" />
                                  <Label htmlFor="m-month" className="text-sm">
                                    This Month
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <Button
                              onClick={() => setExpenseFiltersOpen(false)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </>
                ) : (
                  <Dialog
                    open={expenseDialogOpen}
                    onOpenChange={setExpenseDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button aria-label="Add expense">
                        <Plus className="h-4 w-4 mr-2" />
                        Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingExpense ? "Edit Expense" : "Add New Expense"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingExpense
                            ? "Update your expense details."
                            : "Record a new hosting-related expense."}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...expenseForm}>
                        <form
                          onSubmit={expenseForm.handleSubmit(onExpenseSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={expenseForm.control}
                            name="trip_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trip# *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Trip ID"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="car_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Car
                                  {field.value && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Auto-filled
                                    </Badge>
                                  )}
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a car (optional)" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {cars.map((car) => (
                                      <SelectItem key={car.id} value={car.id}>
                                        {formatCarDisplayName(car)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="guest_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Guest Name
                                  {field.value && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Auto-filled
                                    </Badge>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter guest name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <h4 className="font-medium">Cost Breakdown</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={expenseForm.control}
                                name="ev_charge_cost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EV Charge Cost</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="carwash_cost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Carwash Cost</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="delivery_cost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Delivery Cost</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={expenseForm.control}
                                name="toll_cost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Toll Cost</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={expenseForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Other Expenses</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={expenseForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the expense..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expenseForm.control}
                            name="expense_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="pt-2 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setExpenseDialogOpen(false);
                                setEditingExpense(null);
                                expenseForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingExpense
                                ? "Update Expense"
                                : "Add Expense"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Expense Filters */}
              {!isMobile && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <CardTitle className="text-base">Filters</CardTitle>
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {activeFiltersCount} active
                          </Badge>
                        )}
                      </div>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Trip# Search Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Trip#</Label>
                        <Input
                          placeholder="Search by trip#..."
                          value={expenseFilters.tripSearch}
                          onChange={(e) =>
                            setExpenseFilters((prev) => ({
                              ...prev,
                              tripSearch: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Car Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Car</Label>
                        <Select
                          value={expenseFilters.carId}
                          onValueChange={(value) =>
                            setExpenseFilters((prev) => ({
                              ...prev,
                              carId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All cars" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All cars</SelectItem>
                            {cars.map((car) => (
                              <SelectItem key={car.id} value={car.id}>
                                {formatCarDisplayName(car)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Source Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Payment Source
                        </Label>
                        <Select
                          value={expenseFilters.paymentSource}
                          onValueChange={(value) =>
                            setExpenseFilters((prev) => ({
                              ...prev,
                              paymentSource: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All sources" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All sources</SelectItem>
                            <SelectItem value="Turo">Turo</SelectItem>
                            <SelectItem value="Eon">Eon</SelectItem>
                            <SelectItem value="GetAround">GetAround</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="Insurance">Insurance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Added Recently
                        </Label>
                        <RadioGroup
                          value={expenseFilters.dateRange}
                          onValueChange={(value) =>
                            setExpenseFilters((prev) => ({
                              ...prev,
                              dateRange: value,
                            }))
                          }
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all" className="text-sm">
                              All
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="today" id="today" />
                            <Label htmlFor="today" className="text-sm">
                              Today
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="week" id="week" />
                            <Label htmlFor="week" className="text-sm">
                              This Week
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="month" id="month" />
                            <Label htmlFor="month" className="text-sm">
                              This Month
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredExpenses.length} of {expenses.length}{" "}
                        expenses
                      </p>
                      {activeFiltersCount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {activeFiltersCount === 1
                            ? "1 filter applied"
                            : `${activeFiltersCount} filters applied`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {expensesLoading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-lg text-muted-foreground">
                      Loading expenses...
                    </div>
                  </CardContent>
                </Card>
              ) : expenses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No expenses recorded
                    </h3>
                    <p className="text-muted-foreground">
                      Start tracking your hosting expenses.
                    </p>
                    <Button
                      onClick={() => fetchExpenses(true)}
                      className="mt-4"
                    >
                      Refresh Expenses
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredExpenses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No expenses match your filters
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredExpenses.map((expense) => (
                    <Card key={expense.id}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium capitalize break-words">
                                {expense.expense_type}
                              </h4>
                              {expense.trip_id && (
                                <Badge variant="outline" className="text-xs">
                                  Trip# {expense.trip_id}
                                </Badge>
                              )}
                            </div>
                            {expense.guest_name && (
                              <p className="text-sm text-muted-foreground break-words">
                                Guest: {expense.guest_name}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground break-words">
                              {expense.description}
                            </p>
                            <p className="text-sm text-muted-foreground break-words">
                              {new Date(
                                expense.expense_date
                              ).toLocaleDateString()}
                            </p>

                            {/* Cost Breakdown */}
                            <div className="mt-2 space-y-1">
                              {expense.ev_charge_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>EV Charge:</span>
                                  <span>
                                    ${expense.ev_charge_cost.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {expense.carwash_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Carwash:</span>
                                  <span>
                                    ${expense.carwash_cost.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {expense.delivery_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Delivery:</span>
                                  <span>
                                    ${expense.delivery_cost.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {expense.toll_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Tolls:</span>
                                  <span>${expense.toll_cost.toFixed(2)}</span>
                                </div>
                              )}
                              {expense.amount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Other:</span>
                                  <span>${expense.amount.toFixed(2)}</span>
                                </div>
                              )}
                            </div>

                            {/* Car Details */}
                            {(() => {
                              const expenseCar = cars.find(
                                (car) => car.id === expense.car_id
                              );
                              if (!expenseCar) return null;
                              return (
                                <div className="border-t mt-3 pt-3">
                                  <p className="text-sm font-medium mb-2">
                                    Vehicle Details:
                                  </p>
                                  {formatDetailedCarInfo(expenseCar)}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-right">
                            <div className="flex items-start gap-2 mb-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditExpense(expense)}
                                  >
                                    <Edit className="h-3 w-3 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDeleteExpense(expense.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="h-3 w-3 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="font-bold text-lg">
                              $
                              {expense.total_expenses?.toFixed(2) ||
                                expense.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4  sm:px-0">
              <div className="flex items-center justify-start gap-2 sm:justify-between">
                {/* <h3 className="text-lg font-medium">Earnings</h3> */}
                <>
                  {isMobile ? (
                    <>
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center justify-between w-full">
                          <Button
                            size="sm"
                            onClick={handleAddEarningClick}
                            aria-label="Add earning"
                            className="h-8 px-3 font-medium"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Earning
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEarningFiltersOpen(true)}
                              className="h-8 px-3"
                              aria-label="Open filters"
                            >
                              <Filter className="h-4 w-4 mr-2" />
                              Filters
                              {activeEarningsFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                  {activeEarningsFiltersCount}
                                </Badge>
                              )}
                            </Button>

                            {activeEarningsFiltersCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearEarningsFilters}
                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear filters"
                              >
                                <X className="h-4 w-4 mr-1" />
                                <span className="hidden xs:inline">Clear</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <Sheet
                        open={earningDialogOpen}
                        onOpenChange={setEarningDialogOpen}
                      >
                        <SheetContent
                          side="bottom"
                          className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
                        >
                          <SheetHead>
                            <SheetTit>
                              {editingEarning
                                ? "Edit Earning"
                                : "Record New Earning"}
                            </SheetTit>
                            <SheetDesc>
                              Add a new earning record from your hosting
                              activities.
                            </SheetDesc>
                          </SheetHead>
                          <Form {...earningForm}>
                            <form
                              onSubmit={earningForm.handleSubmit(
                                onEarningSubmit
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={earningForm.control}
                                name="trip_id"
                                render={({ field }) => {
                                  const existingTripIds = [
                                    ...new Set(
                                      expenses
                                        .filter(
                                          (e) =>
                                            e.trip_id && e.trip_id.trim() !== ""
                                        )
                                        .map((e) => e.trip_id)
                                        .filter(Boolean)
                                    ),
                                  ] as string[];
                                  return (
                                    <FormItem>
                                      <FormLabel>Trip# *</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select existing Trip# or enter new" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {existingTripIds.map((tripId) => {
                                            const tripExpenses =
                                              expenses.filter(
                                                (e) => e.trip_id === tripId
                                              );
                                            const totalExpenses =
                                              tripExpenses.reduce(
                                                (sum, e) =>
                                                  sum +
                                                  (e.total_expenses ||
                                                    e.amount),
                                                0
                                              );
                                            return (
                                              <SelectItem
                                                key={tripId}
                                                value={tripId}
                                              >
                                                {tripId} (Expenses: $
                                                {totalExpenses.toFixed(2)})
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <div className="mt-2">
                                        <Input
                                          placeholder="Or enter new Trip ID"
                                          value={field.value}
                                          onChange={field.onChange}
                                        />
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="car_id"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        Car
                                        {field.value && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            Auto-filled
                                          </Badge>
                                        )}
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a car" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {cars.map((car) => (
                                            <SelectItem
                                              key={car.id}
                                              value={car.id}
                                            >
                                              {formatCarDisplayName(car)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="guest_name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        Guest Name
                                        {field.value && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            Auto-filled
                                          </Badge>
                                        )}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter guest name"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_type"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Earning Type</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select earning type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="hosting">
                                            Hosting
                                          </SelectItem>
                                          <SelectItem value="delivery">
                                            Delivery
                                          </SelectItem>
                                          <SelectItem value="subscription">
                                            Subscription
                                          </SelectItem>
                                          <SelectItem value="bonus">
                                            Bonus
                                          </SelectItem>
                                          <SelectItem value="other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="payment_source"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Payment Source</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select payment source" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Turo">
                                            Turo
                                          </SelectItem>
                                          <SelectItem value="Eon">
                                            Eon
                                          </SelectItem>
                                          <SelectItem value="GetAround">
                                            GetAround
                                          </SelectItem>
                                          <SelectItem value="Private">
                                            Private
                                          </SelectItem>
                                          <SelectItem value="Other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={earningForm.control}
                                name="gross_earnings"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Gross Earnings</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {earningForm.watch("gross_earnings") > 0 && (
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                  <h4 className="font-medium text-sm">
                                    Profit Calculation
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Gross Earnings:</span>
                                      <span>
                                        $
                                        {Number(
                                          earningForm.watch("gross_earnings") ||
                                            0
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>Trip Expenses:</span>
                                      <span>
                                        -${selectedTripExpenses.toFixed(2)}
                                      </span>
                                    </div>
                                    <hr className="my-1" />
                                    <div className="flex justify-between font-medium">
                                      <span>Net Earnings:</span>
                                      <span>
                                        $
                                        {(
                                          Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) - selectedTripExpenses
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-blue-600">
                                      <span>
                                        Client Profit (
                                        {earningForm.watch(
                                          "client_profit_percentage"
                                        )}
                                        %):
                                      </span>
                                      <span>
                                        $
                                        {(
                                          ((Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) -
                                            selectedTripExpenses) *
                                            Number(
                                              earningForm.watch(
                                                "client_profit_percentage"
                                              )
                                            )) /
                                          100
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                      <span>
                                        Host Profit (
                                        {earningForm.watch(
                                          "host_profit_percentage"
                                        )}
                                        %):
                                      </span>
                                      <span>
                                        $
                                        {(
                                          ((Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) -
                                            selectedTripExpenses) *
                                            Number(
                                              earningForm.watch(
                                                "host_profit_percentage"
                                              )
                                            )) /
                                          100
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="client_profit_percentage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Profit %</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="1"
                                          placeholder="30"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 30
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="host_profit_percentage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Host Profit %</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="1"
                                          placeholder="70"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 70
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_start_date"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_start_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_end_date"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_end_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {dateConflicts.length > 0 && (
                                <ConflictWarning
                                  conflicts={dateConflicts}
                                  selectedDates={{
                                    start: `${earningForm.watch(
                                      "earning_period_start_date"
                                    )}T${earningForm.watch(
                                      "earning_period_start_time"
                                    )}:00`,
                                    end: `${earningForm.watch(
                                      "earning_period_end_date"
                                    )}T${earningForm.watch(
                                      "earning_period_end_time"
                                    )}:00`,
                                  }}
                                />
                              )}

                              {earningForm.watch("car_id") && (
                                <div className="flex justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setShowCalendar(!showCalendar)
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Calendar className="h-4 w-4" />
                                    {showCalendar ? "Hide" : "Show"} Booking
                                    Calendar
                                  </Button>
                                </div>
                              )}

                              {showCalendar && earningForm.watch("car_id") && (
                                <AvailabilityCalendar
                                  carId={earningForm.watch("car_id")}
                                />
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="payment_status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Payment Status</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select payment status" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="paid">
                                            Paid
                                          </SelectItem>
                                          <SelectItem value="processing">
                                            Processing
                                          </SelectItem>
                                          <SelectItem value="failed">
                                            Failed
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="date_paid"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Date Paid (Optional)
                                      </FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="pt-2 flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setEarningDialogOpen(false);
                                    setEditingEarning(null);
                                    earningForm.reset();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">
                                  {editingEarning
                                    ? "Update Earning"
                                    : "Record Earning"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </SheetContent>
                      </Sheet>

                      {/* Earnings Filters Sheet (mobile) */}
                      <Sheet
                        open={earningFiltersOpen}
                        onOpenChange={setEarningFiltersOpen}
                      >
                        <SheetContent
                          side="bottom"
                          className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto text-base"
                        >
                          <SheetHead>
                            <SheetTit>Earning Filters</SheetTit>
                            <SheetDesc>Refine the list of earnings.</SheetDesc>
                          </SheetHead>

                          <div className="space-y-4">
                            {/* Header row: Filters + count + Clear */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Filters
                                </span>
                                {earningsActiveFiltersCount > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {earningsActiveFiltersCount} active
                                  </Badge>
                                )}
                              </div>
                              {earningsActiveFiltersCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearEarningsFilters}
                                  className="h-8 px-2"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Clear
                                </Button>
                              )}
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* Trip Search */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Search by Trip#
                                </Label>
                                <Input
                                  placeholder="Enter trip number..."
                                  value={earningsFilters.tripSearch}
                                  onChange={(e) =>
                                    setEarningsFilters((p) => ({
                                      ...p,
                                      tripSearch: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              {/* Car */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Car
                                </Label>
                                <Select
                                  value={earningsFilters.carId}
                                  onValueChange={(value) =>
                                    setEarningsFilters((p) => ({
                                      ...p,
                                      carId: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="All cars" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All cars
                                    </SelectItem>
                                    {cars.map((car) => (
                                      <SelectItem key={car.id} value={car.id}>
                                        {formatCarDisplayName(car)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Payment Source */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Payment Source
                                </Label>
                                <Select
                                  value={earningsFilters.paymentSource}
                                  onValueChange={(value) =>
                                    setEarningsFilters((p) => ({
                                      ...p,
                                      paymentSource: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="All sources" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All sources
                                    </SelectItem>
                                    <SelectItem value="Turo">Turo</SelectItem>
                                    <SelectItem value="Eon">Eon</SelectItem>
                                    <SelectItem value="GetAround">
                                      GetAround
                                    </SelectItem>
                                    <SelectItem value="Private">
                                      Private
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Payment Status */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Payment Status
                                </Label>
                                <Select
                                  value={earningsFilters.paymentStatus}
                                  onValueChange={(value) =>
                                    setEarningsFilters((p) => ({
                                      ...p,
                                      paymentStatus: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All statuses
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="processing">
                                      Processing
                                    </SelectItem>
                                    <SelectItem value="failed">
                                      Failed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Date Range */}
                              {/* Date Range (match Expenses modal) */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Date Range
                                </Label>
                                <RadioGroup
                                  value={earningsFilters.dateRange}
                                  onValueChange={(value) =>
                                    setEarningsFilters((prev) => ({
                                      ...prev,
                                      dateRange: value as any,
                                    }))
                                  }
                                  className="flex flex-wrap gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="all"
                                      id="e-all"
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="e-all" className="text-sm">
                                      All
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="today"
                                      id="e-today"
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor="e-today"
                                      className="text-sm"
                                    >
                                      Today
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="week"
                                      id="e-week"
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="e-week" className="text-sm">
                                      This Week
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="month"
                                      id="e-month"
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor="e-month"
                                      className="text-sm"
                                    >
                                      This Month
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Button
                                onClick={() => setEarningFiltersOpen(false)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={handleAddEarningClick}
                        aria-label="Add earning"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Earning
                      </Button>
                      <Dialog
                        open={earningDialogOpen}
                        onOpenChange={setEarningDialogOpen}
                      >
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {editingEarning
                                ? "Edit Earning"
                                : "Record New Earning"}
                            </DialogTitle>
                            <DialogDescription>
                              Add a new earning record from your hosting
                              activities.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...earningForm}>
                            <form
                              onSubmit={earningForm.handleSubmit(
                                onEarningSubmit
                              )}
                              className="space-y-4"
                            >
                              <FormField
                                control={earningForm.control}
                                name="trip_id"
                                render={({ field }) => {
                                  const existingTripIds = [
                                    ...new Set(
                                      expenses
                                        .filter(
                                          (e) =>
                                            e.trip_id && e.trip_id.trim() !== ""
                                        )
                                        .map((e) => e.trip_id)
                                        .filter(Boolean)
                                    ),
                                  ] as string[];
                                  return (
                                    <FormItem>
                                      <FormLabel>Trip# *</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select existing Trip# or enter new" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {existingTripIds.map((tripId) => {
                                            const tripExpenses =
                                              expenses.filter(
                                                (e) => e.trip_id === tripId
                                              );
                                            const totalExpenses =
                                              tripExpenses.reduce(
                                                (sum, e) =>
                                                  sum +
                                                  (e.total_expenses ||
                                                    e.amount),
                                                0
                                              );
                                            return (
                                              <SelectItem
                                                key={tripId}
                                                value={tripId}
                                              >
                                                {tripId} (Expenses: $
                                                {totalExpenses.toFixed(2)})
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <div className="mt-2">
                                        <Input
                                          placeholder="Or enter new Trip ID"
                                          value={field.value}
                                          onChange={field.onChange}
                                        />
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="car_id"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        Car
                                        {field.value && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            Auto-filled
                                          </Badge>
                                        )}
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a car" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {cars.map((car) => (
                                            <SelectItem
                                              key={car.id}
                                              value={car.id}
                                            >
                                              {formatCarDisplayName(car)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="guest_name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        Guest Name
                                        {field.value && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            Auto-filled
                                          </Badge>
                                        )}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter guest name"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_type"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Earning Type</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select earning type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="hosting">
                                            Hosting
                                          </SelectItem>
                                          <SelectItem value="delivery">
                                            Delivery
                                          </SelectItem>
                                          <SelectItem value="subscription">
                                            Subscription
                                          </SelectItem>
                                          <SelectItem value="bonus">
                                            Bonus
                                          </SelectItem>
                                          <SelectItem value="other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="payment_source"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Payment Source</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select payment source" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Turo">
                                            Turo
                                          </SelectItem>
                                          <SelectItem value="Eon">
                                            Eon
                                          </SelectItem>
                                          <SelectItem value="GetAround">
                                            GetAround
                                          </SelectItem>
                                          <SelectItem value="Private">
                                            Private
                                          </SelectItem>
                                          <SelectItem value="Other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={earningForm.control}
                                name="gross_earnings"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Gross Earnings</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {earningForm.watch("gross_earnings") > 0 && (
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                  <h4 className="font-medium text-sm">
                                    Profit Calculation
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Gross Earnings:</span>
                                      <span>
                                        $
                                        {Number(
                                          earningForm.watch("gross_earnings") ||
                                            0
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>Trip Expenses:</span>
                                      <span>
                                        -${selectedTripExpenses.toFixed(2)}
                                      </span>
                                    </div>
                                    <hr className="my-1" />
                                    <div className="flex justify-between font-medium">
                                      <span>Net Earnings:</span>
                                      <span>
                                        $
                                        {(
                                          Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) - selectedTripExpenses
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-blue-600">
                                      <span>
                                        Client Profit (
                                        {earningForm.watch(
                                          "client_profit_percentage"
                                        )}
                                        %):
                                      </span>
                                      <span>
                                        $
                                        {(
                                          ((Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) -
                                            selectedTripExpenses) *
                                            Number(
                                              earningForm.watch(
                                                "client_profit_percentage"
                                              )
                                            )) /
                                          100
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                      <span>
                                        Host Profit (
                                        {earningForm.watch(
                                          "host_profit_percentage"
                                        )}
                                        %):
                                      </span>
                                      <span>
                                        $
                                        {(
                                          ((Number(
                                            earningForm.watch(
                                              "gross_earnings"
                                            ) || 0
                                          ) -
                                            selectedTripExpenses) *
                                            Number(
                                              earningForm.watch(
                                                "host_profit_percentage"
                                              )
                                            )) /
                                          100
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="client_profit_percentage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Profit %</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="1"
                                          placeholder="30"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 30
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="host_profit_percentage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Host Profit %</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          inputMode="decimal"
                                          step="1"
                                          placeholder="70"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 70
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_start_date"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_start_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_end_date"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="earning_period_end_time"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Time</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {dateConflicts.length > 0 && (
                                <ConflictWarning
                                  conflicts={dateConflicts}
                                  selectedDates={{
                                    start: `${earningForm.watch(
                                      "earning_period_start_date"
                                    )}T${earningForm.watch(
                                      "earning_period_start_time"
                                    )}:00`,
                                    end: `${earningForm.watch(
                                      "earning_period_end_date"
                                    )}T${earningForm.watch(
                                      "earning_period_end_time"
                                    )}:00`,
                                  }}
                                />
                              )}

                              {earningForm.watch("car_id") && (
                                <div className="flex justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setShowCalendar(!showCalendar)
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Calendar className="h-4 w-4" />
                                    {showCalendar ? "Hide" : "Show"} Booking
                                    Calendar
                                  </Button>
                                </div>
                              )}

                              {showCalendar && earningForm.watch("car_id") && (
                                <AvailabilityCalendar
                                  carId={earningForm.watch("car_id")}
                                />
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={earningForm.control}
                                  name="payment_status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Payment Status</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select payment status" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="paid">
                                            Paid
                                          </SelectItem>
                                          <SelectItem value="processing">
                                            Processing
                                          </SelectItem>
                                          <SelectItem value="failed">
                                            Failed
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={earningForm.control}
                                  name="date_paid"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Date Paid (Optional)
                                      </FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="pt-2 flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setEarningDialogOpen(false);
                                    setEditingEarning(null);
                                    earningForm.reset();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">
                                  {editingEarning
                                    ? "Update Earning"
                                    : "Record Earning"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </>
              </div>

              {/* Earnings Filters */}
              {!isMobile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filter Earnings</h4>
                        {activeEarningsFiltersCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearEarningsFilters}
                            className="h-8"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Trip Search */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Search by Trip#
                          </Label>
                          <Input
                            placeholder="Enter trip#..."
                            value={earningsFilters.tripSearch}
                            onChange={(e) =>
                              setEarningsFilters((prev) => ({
                                ...prev,
                                tripSearch: e.target.value,
                              }))
                            }
                            className="h-8"
                          />
                        </div>
                        {/* Car Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Car
                          </Label>
                          <Select
                            value={earningsFilters.carId}
                            onValueChange={(value) =>
                              setEarningsFilters((prev) => ({
                                ...prev,
                                carId: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All cars" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All cars</SelectItem>
                              {cars.map((car) => (
                                <SelectItem key={car.id} value={car.id}>
                                  {formatCarDisplayName(car)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Source Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Payment Source
                          </Label>
                          <Select
                            value={earningsFilters.paymentSource}
                            onValueChange={(value) =>
                              setEarningsFilters((prev) => ({
                                ...prev,
                                paymentSource: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All sources" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All sources</SelectItem>
                              <SelectItem value="Turo">Turo</SelectItem>
                              <SelectItem value="Eon">Eon</SelectItem>
                              <SelectItem value="GetAround">
                                GetAround
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Payment Status
                          </Label>
                          <Select
                            value={earningsFilters.paymentStatus}
                            onValueChange={(value) =>
                              setEarningsFilters((prev) => ({
                                ...prev,
                                paymentStatus: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Date Range
                          </Label>
                          <Select
                            value={earningsFilters.dateRange}
                            onValueChange={(value) =>
                              setEarningsFilters((prev) => ({
                                ...prev,
                                dateRange: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">This Week</SelectItem>
                              <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Results Summary */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {filteredEarnings.length} of {earnings.length}{" "}
                          earnings
                        </p>
                        {activeEarningsFiltersCount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {activeEarningsFiltersCount === 1
                              ? "1 filter applied"
                              : `${activeEarningsFiltersCount} filters applied`}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {earnings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No earnings recorded
                    </h3>
                    <p className="text-muted-foreground">
                      Start tracking your hosting earnings.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredEarnings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No earnings match your filters
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button variant="outline" onClick={clearEarningsFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="mx-0 max-w-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Earnings
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              $
                              {earnings
                                .reduce((sum, e) => sum + e.amount, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="mx-0 max-w-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Pending Payments
                            </p>
                            <p className="text-2xl font-bold text-yellow-600">
                              $
                              {earnings
                                .filter((e) => e.payment_status === "pending")
                                .reduce((sum, e) => sum + e.amount, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="mx-0 max-w-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              This Month
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              $
                              {earnings
                                .filter(
                                  (e) =>
                                    new Date(
                                      e.earning_period_start
                                    ).getMonth() === new Date().getMonth()
                                )
                                .reduce((sum, e) => sum + e.amount, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Earnings List */}
                  <div className="grid gap-4">
                    {filteredEarnings.map((earning) => {
                      // Calculate related expenses for this trip
                      const relatedExpenses = earning.trip_id
                        ? expenses.filter((e) => e.trip_id === earning.trip_id)
                        : [];
                      const totalExpenses = relatedExpenses.reduce(
                        (sum, e) => sum + (e.total_expenses || e.amount),
                        0
                      );
                      const netProfit = earning.amount - totalExpenses;

                      return (
                        <Card key={earning.id}>
                          <CardContent className="p-3 sm:p-4">
                            {/* Row 1: Title (Hosting) + actions */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold capitalize">
                                {earning.earning_type}
                              </h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditEarning(earning)}
                                  >
                                    <Edit className="h-3 w-3 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDeleteEarning(earning.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="h-3 w-3 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Row 2: Amount */}
                            <div className="mt-1 mb-2">
                              <p className="font-bold text-2xl text-green-600 leading-none">
                                ${earning.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Amount
                              </p>
                              {earning.date_paid && (
                                <p className="text-xs text-muted-foreground">
                                  Paid:{" "}
                                  {new Date(
                                    earning.date_paid
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* Row 3: Trip + payment status */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {earning.trip_id && (
                                <Badge variant="outline" className="text-xs">
                                  Trip# {earning.trip_id}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  earning.payment_status === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {earning.payment_status}
                              </Badge>
                            </div>

                            {/* Rest (unchanged content) */}
                            <div className="space-y-2">
                              {earning.guest_name && (
                                <p className="text-sm text-muted-foreground break-words">
                                  Guest: {earning.guest_name}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground break-words">
                                {new Date(
                                  earning.earning_period_start
                                ).toLocaleDateString()}{" "}
                                –{" "}
                                {new Date(
                                  earning.earning_period_end
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground break-words">
                                Source: {earning.payment_source}
                              </p>

                              {/* Profit breakdown */}
                              <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                                <div>
                                  <span className="text-muted-foreground">
                                    Gross Earnings:
                                  </span>
                                  <p className="font-medium">
                                    $
                                    {earning.gross_earnings?.toFixed(2) ||
                                      "0.00"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Client Profit (
                                    {earning.client_profit_percentage}%):
                                  </span>
                                  <p className="font-medium">
                                    $
                                    {(((earning.gross_earnings || 0) * (earning.client_profit_percentage || 70)) / 100).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Host Profit (
                                    {earning.host_profit_percentage}%):
                                  </span>
                                  <p className="font-medium">
                                    $
                                    {(((earning.gross_earnings || 0) * (earning.host_profit_percentage || 30)) / 100).toFixed(2)}
                                  </p>
                                </div>

                                {/* Expenses + net profit (if any) */}
                                {(() => {
                                  const relatedExpenses = earning.trip_id
                                    ? expenses.filter(
                                        (e) => e.trip_id === earning.trip_id
                                      )
                                    : [];
                                  const totalExpenses = relatedExpenses.reduce(
                                    (sum, e) =>
                                      sum + (e.total_expenses || e.amount),
                                    0
                                  );
                                  const netProfit =
                                    earning.amount - totalExpenses;

                                  return totalExpenses > 0 ? (
                                    <>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Total Expenses:
                                        </span>
                                        <p className="font-medium text-red-600">
                                          -${totalExpenses.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Net Profit:
                                        </span>
                                        <p
                                          className={`font-medium ${
                                            netProfit >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          ${netProfit.toFixed(2)}
                                        </p>
                                      </div>
                                    </>
                                  ) : null;
                                })()}
                              </div>

                              {/* Related expenses count */}
                              {earning.trip_id &&
                                expenses.some(
                                  (e) => e.trip_id === earning.trip_id
                                ) && (
                                  <div className="text-xs text-muted-foreground">
                                    Related expenses:{" "}
                                    {
                                      expenses.filter(
                                        (e) => e.trip_id === earning.trip_id
                                      ).length
                                    }{" "}
                                    item(s)
                                  </div>
                                )}

                              {/* Vehicle details */}
                              {(() => {
                                const earningCar = cars.find(
                                  (car) => car.id === earning.car_id
                                );
                                return earningCar ? (
                                  <div className="border-t mt-3 pt-3">
                                    <p className="text-sm font-medium mb-2">
                                      Vehicle Details:
                                    </p>
                                    {formatDetailedCarInfo(earningCar)}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="claims" className="space-y-4  sm:px-0">
              {/* <h3 className="text-lg font-medium">Claims</h3> */}
              {isMobile ? (
                <div className="flex items-center justify-between w-full">
                  <Button
                    size="sm"
                    onClick={() => setClaimDialogOpen(true)}
                    className="h-8 px-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    File Claim
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClaimsFiltersOpen(true)}
                      className="h-8 px-3"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeClaimsFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeClaimsFiltersCount}
                        </Badge>
                      )}
                    </Button>

                    {activeClaimsFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearClaimsFilters}
                        className="h-8 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <Sheet
                    open={claimDialogOpen}
                    onOpenChange={setClaimDialogOpen}
                  >
                    <SheetContent
                      side="bottom"
                      className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
                    >
                      <SheetHead>
                        <SheetTit>
                          {editingClaim ? "Edit Claim" : "File New Claim"}
                        </SheetTit>
                        <SheetDesc>
                          {editingClaim
                            ? "Update your claim details."
                            : "Submit a claim for damages or incidents."}
                        </SheetDesc>
                      </SheetHead>
                      <Form {...claimForm}>
                        <form
                          onSubmit={claimForm.handleSubmit(onClaimSubmit)}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={claimForm.control}
                              name="car_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Car *</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a car" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent
                                      className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                      position="popper"
                                      side="bottom"
                                      avoidCollisions={false}
                                      onPointerDownOutside={(e) =>
                                        e.stopPropagation()
                                      }
                                    >
                                      {cars.map((car) => (
                                        <SelectItem key={car.id} value={car.id}>
                                          {formatCarDisplayName(car)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={claimForm.control}
                              name="claim_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Claim Type *</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select claim type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent
                                      className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                      position="popper"
                                      side="bottom"
                                      avoidCollisions={false}
                                      onPointerDownOutside={(e) =>
                                        e.stopPropagation()
                                      }
                                    >
                                      <SelectItem value="damage">
                                        Physical Damage
                                      </SelectItem>
                                      <SelectItem value="theft">
                                        Theft
                                      </SelectItem>
                                      <SelectItem value="accident">
                                        Accident
                                      </SelectItem>
                                      <SelectItem value="vandalism">
                                        Vandalism
                                      </SelectItem>
                                      <SelectItem value="mechanical">
                                        Mechanical Issues
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={claimForm.control}
                            name="incident_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Incident ID</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter incident ID (optional)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={claimForm.control}
                            name="trip_id"
                            render={({ field }) => {
                              const selectedCarId = claimForm.watch("car_id");
                              const allTripIds = [
                                ...new Set(
                                  expenses
                                    .filter(
                                      (e) =>
                                        e.trip_id && e.trip_id.trim() !== ""
                                    )
                                    .map((e) => e.trip_id)
                                    .filter(Boolean)
                                ),
                              ] as string[];
                              const availableTripIds = selectedCarId
                                ? ([
                                    ...new Set(
                                      expenses
                                        .filter(
                                          (e) =>
                                            e.car_id === selectedCarId &&
                                            e.trip_id &&
                                            e.trip_id.trim() !== ""
                                        )
                                        .map((e) => e.trip_id)
                                        .filter(Boolean)
                                    ),
                                  ] as string[])
                                : allTripIds;
                              return (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Trip ID
                                    {field.value && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        Auto-filled
                                      </Badge>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <div className="space-y-2">
                                      {loading ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                          <span className="text-sm text-muted-foreground">
                                            Loading trip IDs...
                                          </span>
                                        </div>
                                      ) : availableTripIds.length > 0 ? (
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            // Auto-populate car field based on trip ID
                                            const expenseWithTripId =
                                              expenses.find(
                                                (e) =>
                                                  e.trip_id === value &&
                                                  e.car_id
                                              );
                                            if (
                                              expenseWithTripId &&
                                              expenseWithTripId.car_id
                                            ) {
                                              claimForm.setValue(
                                                "car_id",
                                                expenseWithTripId.car_id
                                              );
                                            }
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue
                                              placeholder={
                                                selectedCarId
                                                  ? `Select trip ID (${availableTripIds.length} for this car)`
                                                  : `Select trip ID (${availableTripIds.length} total)`
                                              }
                                            />
                                          </SelectTrigger>
                                          <SelectContent
                                            className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                            position="popper"
                                            side="bottom"
                                            avoidCollisions={false}
                                            onPointerDownOutside={(e) =>
                                              e.stopPropagation()
                                            }
                                          >
                                            {availableTripIds.map((tripId) => (
                                              <SelectItem
                                                key={tripId}
                                                value={tripId}
                                              >
                                                {tripId}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : selectedCarId ? (
                                        <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                                          No existing trip IDs found for this
                                          car. You can enter a new one below.
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                                          No trip IDs found in expenses. You can
                                          enter a new one below.
                                        </div>
                                      )}
                                      <Input
                                        placeholder={
                                          availableTripIds.length > 0
                                            ? "Or enter new trip ID"
                                            : "Enter trip ID"
                                        }
                                        value={field.value}
                                        onChange={field.onChange}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={claimForm.control}
                              name="guest_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Guest Name
                                    {field.value && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        Auto-filled
                                      </Badge>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Guest name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={claimForm.control}
                              name="payment_source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Payment Source
                                    {field.value && field.value !== "Turo" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        Auto-filled
                                      </Badge>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select payment source" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Turo">Turo</SelectItem>
                                      <SelectItem value="Eon">Eon</SelectItem>
                                      <SelectItem value="GetAround">
                                        GetAround
                                      </SelectItem>
                                      <SelectItem value="Private">
                                        Private
                                      </SelectItem>
                                      <SelectItem value="Insurance">
                                        Insurance
                                      </SelectItem>
                                      <SelectItem value="Other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={claimForm.control}
                            name="incident_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Incident Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={claimForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Incident Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe what happened..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={claimForm.control}
                            name="accident_description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Detailed Accident Description
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Provide additional details about the accident..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={claimForm.control}
                            name="claim_amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Claim Amount</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                              control={claimForm.control}
                              name="photos_taken"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-4 w-4"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Photos taken of damage/incident
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />

                          <FormField
                              control={claimForm.control}
                              name="is_paid"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-4 w-4"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Claim has been paid
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />

                          <div className="pt-2 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setClaimDialogOpen(false);
                                setEditingClaim(null);
                                claimForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingClaim ? "Update Claim" : "Submit Claim"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </SheetContent>
                  </Sheet>

                  <Sheet
                    open={claimsFiltersOpen}
                    onOpenChange={setClaimsFiltersOpen}
                  >
                    <SheetContent
                      side="bottom"
                      className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
                    >
                      <SheetHead>
                        <SheetTit>Claims Filters</SheetTit>
                        <SheetDesc>Refine the list of claims.</SheetDesc>
                      </SheetHead>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span className="text-sm font-medium">Filters</span>
                          {activeClaimsFiltersCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {activeClaimsFiltersCount} active
                            </Badge>
                          )}
                        </div>
                        {activeClaimsFiltersCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearClaimsFilters}
                            className="h-8 px-2"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label className="text-xs font-medium mb-2 block">
                              Car
                            </Label>
                            <Select
                              value={claimsFilters.carId}
                              onValueChange={(value) =>
                                setClaimsFilters((prev) => ({
                                  ...prev,
                                  carId: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="All cars" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All cars</SelectItem>
                                {cars.map((car) => (
                                  <SelectItem key={car.id} value={car.id}>
                                    {formatCarDisplayName(car)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-2 block">
                              Claim Status
                            </Label>
                            <Select
                              value={claimsFilters.claimStatus}
                              onValueChange={(value) =>
                                setClaimsFilters((prev) => ({
                                  ...prev,
                                  claimStatus: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="All statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All statuses
                                </SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">
                                  Approved
                                </SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-2 block">
                              Claim Type
                            </Label>
                            <Select
                              value={claimsFilters.claimType}
                              onValueChange={(value) =>
                                setClaimsFilters((prev) => ({
                                  ...prev,
                                  claimType: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="All types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {distinctClaimTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-2 block">
                              Date Range
                            </Label>
                            <Select
                              value={claimsFilters.dateRange}
                              onValueChange={(value) =>
                                setClaimsFilters((prev) => ({
                                  ...prev,
                                  dateRange: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="All time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">
                                  This Month
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <Button onClick={() => setClaimsFiltersOpen(false)}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              ) : (
                <Dialog
                  open={claimDialogOpen}
                  onOpenChange={setClaimDialogOpen}
                  modal={!isMobile}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      File Claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingClaim ? "Edit Claim" : "File New Claim"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingClaim
                          ? "Update your claim details."
                          : "Submit a claim for damages or incidents."}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...claimForm}>
                      <form
                        onSubmit={claimForm.handleSubmit(onClaimSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={claimForm.control}
                            name="car_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Car *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a car" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent
                                    className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                    position="popper"
                                    side="bottom"
                                    avoidCollisions={false}
                                    onPointerDownOutside={(e) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    {cars.map((car) => (
                                      <SelectItem key={car.id} value={car.id}>
                                        {formatCarDisplayName(car)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={claimForm.control}
                            name="claim_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Claim Type *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select claim type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent
                                    className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                    position="popper"
                                    side="bottom"
                                    avoidCollisions={false}
                                    onPointerDownOutside={(e) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    <SelectItem value="damage">
                                      Physical Damage
                                    </SelectItem>
                                    <SelectItem value="theft">Theft</SelectItem>
                                    <SelectItem value="accident">
                                      Accident
                                    </SelectItem>
                                    <SelectItem value="vandalism">
                                      Vandalism
                                    </SelectItem>
                                    <SelectItem value="mechanical">
                                      Mechanical Issues
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={claimForm.control}
                          name="incident_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incident ID</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter incident ID (optional)"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="trip_id"
                          render={({ field }) => {
                            const selectedCarId = claimForm.watch("car_id");
                            const allTripIds = [
                              ...new Set(
                                expenses
                                  .filter(
                                    (e) => e.trip_id && e.trip_id.trim() !== ""
                                  )
                                  .map((e) => e.trip_id)
                                  .filter(Boolean)
                              ),
                            ] as string[];
                            const availableTripIds = selectedCarId
                              ? ([
                                  ...new Set(
                                    expenses
                                      .filter(
                                        (e) =>
                                          e.car_id === selectedCarId &&
                                          e.trip_id &&
                                          e.trip_id.trim() !== ""
                                      )
                                      .map((e) => e.trip_id)
                                      .filter(Boolean)
                                  ),
                                ] as string[])
                              : allTripIds;
                            return (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Trip ID
                                  {field.value && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Auto-filled
                                    </Badge>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    {loading ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Loading trip IDs...
                                        </span>
                                      </div>
                                    ) : availableTripIds.length > 0 ? (
                                      <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          // Auto-populate car field based on trip ID
                                          const expenseWithTripId =
                                            expenses.find(
                                              (e) =>
                                                e.trip_id === value && e.car_id
                                            );
                                          if (
                                            expenseWithTripId &&
                                            expenseWithTripId.car_id
                                          ) {
                                            claimForm.setValue(
                                              "car_id",
                                              expenseWithTripId.car_id
                                            );
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={
                                              selectedCarId
                                                ? `Select trip ID (${availableTripIds.length} for this car)`
                                                : `Select trip ID (${availableTripIds.length} total)`
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectContent
                                          className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                          position="popper"
                                          side="bottom"
                                          avoidCollisions={false}
                                          onPointerDownOutside={(e) =>
                                            e.stopPropagation()
                                          }
                                        >
                                          {availableTripIds.map((tripId) => (
                                            <SelectItem
                                              key={tripId}
                                              value={tripId}
                                            >
                                              {tripId}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : selectedCarId ? (
                                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                                        No existing trip IDs found for this car.
                                        You can enter a new one below.
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                                        No trip IDs found in expenses. You can
                                        enter a new one below.
                                      </div>
                                    )}
                                    <Input
                                      placeholder={
                                        availableTripIds.length > 0
                                          ? "Or enter new trip ID"
                                          : "Enter trip ID"
                                      }
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={claimForm.control}
                            name="guest_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Guest Name
                                  {field.value && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Auto-filled
                                    </Badge>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Guest name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={claimForm.control}
                            name="payment_source"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Payment Source
                                  {field.value && field.value !== "Turo" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Auto-filled
                                    </Badge>
                                  )}
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment source" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent
                                    className="bg-popover border shadow-md z-[9999] touch-manipulation"
                                    position="popper"
                                    side="bottom"
                                    avoidCollisions={false}
                                    onPointerDownOutside={(e) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    <SelectItem value="Turo">Turo</SelectItem>
                                    <SelectItem value="Eon">Eon</SelectItem>
                                    <SelectItem value="GetAround">
                                      GetAround
                                    </SelectItem>
                                    <SelectItem value="Private">
                                      Private
                                    </SelectItem>
                                    <SelectItem value="Insurance">
                                      Insurance
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={claimForm.control}
                          name="incident_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incident Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incident Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe what happened..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="accident_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Detailed Accident Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide additional details about the accident..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="claim_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Claim Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="photos_taken"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Photos taken of damage/incident
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={claimForm.control}
                          name="is_paid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Claim has been paid
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="pt-2 flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setClaimDialogOpen(false);
                              setEditingClaim(null);
                              claimForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingClaim ? "Update Claim" : "Submit Claim"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Claims Filters */}
              {!isMobile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filter Claims</h4>
                        {activeClaimsFiltersCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearClaimsFilters}
                            className="h-8"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear Filters
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Car Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Car
                          </Label>
                          <Select
                            value={claimsFilters.carId}
                            onValueChange={(value) =>
                              setClaimsFilters((prev) => ({
                                ...prev,
                                carId: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All cars" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All cars</SelectItem>
                              {cars.map((car) => (
                                <SelectItem key={car.id} value={car.id}>
                                  {formatCarDisplayName(car)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Claim Status Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Claim Status
                          </Label>
                          <Select
                            value={claimsFilters.claimStatus}
                            onValueChange={(value) =>
                              setClaimsFilters((prev) => ({
                                ...prev,
                                claimStatus: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Claim Type Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Claim Type
                          </Label>
                          <Select
                            value={claimsFilters.claimType}
                            onValueChange={(value) =>
                              setClaimsFilters((prev) => ({
                                ...prev,
                                claimType: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All types</SelectItem>
                              {distinctClaimTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Date Range
                          </Label>
                          <Select
                            value={claimsFilters.dateRange}
                            onValueChange={(value) =>
                              setClaimsFilters((prev) => ({
                                ...prev,
                                dateRange: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">This Week</SelectItem>
                              <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Results Summary */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {filteredClaims.length} of {claims.length}{" "}
                          claims
                        </p>
                        {activeClaimsFiltersCount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {activeClaimsFiltersCount === 1
                              ? "1 filter applied"
                              : `${activeClaimsFiltersCount} filters applied`}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {claims.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No claims filed
                    </h3>
                    <p className="text-muted-foreground">
                      File claims for damages or incidents here.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredClaims.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No claims match your filters
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button variant="outline" onClick={clearClaimsFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Claims Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Claims
                            </p>
                            <p className="text-2xl font-bold">
                              {claims.length}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Pending
                            </p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {
                                claims.filter(
                                  (c) => c.claim_status === "pending"
                                ).length
                              }
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Approved
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {
                                claims.filter(
                                  (c) => c.claim_status === "approved"
                                ).length
                              }
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Amount
                            </p>
                            <p className="text-2xl font-bold">
                              $
                              {claims
                                .reduce(
                                  (sum, c) => sum + (c.claim_amount || 0),
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Claims List */}
                  <div className="grid gap-4">
                    {filteredClaims.map((claim) => {
                      // Find the car for this claim
                      const claimCar = cars.find(
                        (car) => car.id === claim.car_id
                      );

                      return (
                        <Card key={claim.id}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium capitalize break-words">
                                    {claim.claim_type} Claim
                                  </h4>
                                  <Badge
                                    variant={
                                      claim.claim_status === "approved"
                                        ? "default"
                                        : claim.claim_status === "denied"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {claim.claim_status}
                                  </Badge>
                                  {claim.is_paid && (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                      Paid
                                    </Badge>
                                  )}
                                  {claim.trip_id && (
                                    <Badge variant="outline">
                                      Trip# {claim.trip_id}
                                    </Badge>
                                  )}
                                  {claim.incident_id && (
                                    <Badge variant="outline">
                                      Incident# {claim.incident_id}
                                    </Badge>
                                  )}
                                </div>

                                {/* Trip Details */}
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  {claim.guest_name && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">
                                        Guest:
                                      </span>
                                      <span className="font-medium">
                                        {claim.guest_name}
                                      </span>
                                    </div>
                                  )}
                                  {claim.payment_source && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">
                                        •
                                      </span>
                                      <span className="text-muted-foreground">
                                        Source:
                                      </span>
                                      <span className="font-medium">
                                        {claim.payment_source}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Car Details */}
                                {claimCar && (
                                  <div className="border-t mt-3 pt-3">
                                    <p className="text-sm font-medium mb-2">
                                      Vehicle Details:
                                    </p>
                                    {formatDetailedCarInfo(claimCar)}
                                  </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {claim.description}
                                </p>
                                {claim.accident_description && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Details:</strong>{" "}
                                    {claim.accident_description}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  <strong>Incident Date:</strong>{" "}
                                  {new Date(
                                    claim.incident_date
                                  ).toLocaleDateString()}
                                </p>

                                {claim.photos_taken && (
                                  <div className="flex items-center gap-1 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Photos documented</span>
                                  </div>
                                )}

                                {/* Progress Indicators */}
                                {claim.claim_status !== "pending" && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      Filed:{" "}
                                      {new Date(
                                        claim.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-start gap-2 mb-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleEditClaim(claim)}
                                      >
                                        <Edit className="h-3 w-3 mr-2" /> Edit
                                        Claim
                                      </DropdownMenuItem>
                                      {claim.claim_status === "pending" && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setDeleteClaimId(claim.id);
                                              setDeleteClaimDialogOpen(true);
                                            }}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash className="h-3 w-3 mr-2" />{" "}
                                            Delete Claim
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="font-bold text-lg">
                                  ${claim.claim_amount?.toFixed(2) || "0.00"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Claim Amount
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </PageContainer>

        {/* Delete Claim Confirmation Dialog */}
        <AlertDialog
          open={deleteClaimDialogOpen}
          onOpenChange={setDeleteClaimDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Claim</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this claim? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setDeleteClaimDialogOpen(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClaim}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Claim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </DashboardLayout>
  );
}
