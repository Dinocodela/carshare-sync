import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, CheckCircle, XCircle, Settings, Calendar, FileText, AlertTriangle, DollarSign, Plus, Edit, Trash, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  guest_name?: string;
  earning_type: string;
  amount: number;
  gross_earnings?: number;
  commission: number;
  net_amount: number;
  client_profit_percentage?: number;
  host_profit_percentage?: number;
  client_profit_amount?: number;
  host_profit_amount?: number;
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
  claim_type: string;
  description: string;
  claim_amount: number | null;
  approved_amount: number | null;
  incident_date: string;
  claim_status: string;
  claim_number: string | null;
  supporting_documents: string[] | null;
  notes: string | null;
  // Enhanced claim tracking fields
  accident_description?: string;
  photos_taken?: boolean;
  claim_submitted_date?: string;
  adjuster_name?: string;
  adjuster_contact?: string;
  approval_date?: string;
  payout_amount?: number;
  autobody_shop_name?: string;
  shop_contact_info?: string;
  estimate_submitted_date?: string;
  estimate_approved_date?: string;
  repair_dropoff_date?: string;
  estimated_completion_date?: string;
  repair_status?: string;
  car_ready_pickup_date?: string;
  actual_pickup_date?: string;
  post_repair_inspection?: boolean;
  additional_notes?: string;
  final_status?: string;
  created_at: string;
  updated_at: string;
}

const expenseSchema = z.object({
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
  guest_name: z.string().min(1, "Guest name is required"),
  earning_type: z.string().min(1, "Earning type is required"),
  gross_earnings: z.number().min(0.01, "Amount must be greater than 0"),
  payment_source: z.string().min(1, "Payment source is required"),
  earning_period_start: z.string().min(1, "Start date is required"),
  earning_period_end: z.string().min(1, "End date is required"),
  client_profit_percentage: z.number().min(0).max(100).default(30),
  host_profit_percentage: z.number().min(0).max(100).default(70),
  payment_status: z.string().min(1, "Payment status is required"),
  date_paid: z.string().optional(),
});

const claimSchema = z.object({
  car_id: z.string().min(1, "Car is required"),
  claim_type: z.string().min(1, "Claim type is required"),
  description: z.string().min(1, "Description is required"),
  accident_description: z.string().optional(),
  claim_amount: z.number().min(0.01, "Amount must be greater than 0"),
  incident_date: z.string().min(1, "Incident date is required"),
  adjuster_name: z.string().optional(),
  adjuster_contact: z.string().optional(),
  autobody_shop_name: z.string().optional(),
  shop_contact_info: z.string().optional(),
  photos_taken: z.boolean().default(false),
});
export default function HostCarManagement() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [cars, setCars] = useState<CarWithClient[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [earningDialogOpen, setEarningDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      expense_date: new Date().toISOString().split('T')[0],
    },
  });

  const earningForm = useForm<z.infer<typeof earningSchema>>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      car_id: "",
      guest_name: "",
      earning_type: "hosting",
      gross_earnings: 0,
      payment_source: "Turo",
      earning_period_start: new Date().toISOString().split('T')[0],
      earning_period_end: new Date().toISOString().split('T')[0],
      client_profit_percentage: 30,
      host_profit_percentage: 70,
      payment_status: "pending",
    },
  });

  const claimForm = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      car_id: "",
      claim_type: "",
      description: "",
      claim_amount: 0,
      incident_date: new Date().toISOString().split('T')[0],
      photos_taken: false,
    },
  });
  useEffect(() => {
    fetchHostedCars();
    fetchExpenses();
    fetchEarnings();
    fetchClaims();
  }, [user]);
  const fetchHostedCars = async () => {
    if (!user) return;
    try {
      const {
        data: carsData,
        error: carsError
      } = await supabase.from('cars').select('*').eq('host_id', user.id).in('status', ['hosted', 'ready_for_return']).order('updated_at', {
        ascending: false
      });
      if (carsError) throw carsError;
      if (!carsData || carsData.length === 0) {
        setCars([]);
        return;
      }

      // Get unique client IDs
      const clientIds = [...new Set(carsData.map(car => car.client_id).filter(Boolean))];

      // Fetch client profiles
      const {
        data: profilesData,
        error: profilesError
      } = await supabase.from('profiles').select('user_id, first_name, last_name, phone').in('user_id', clientIds);
      if (profilesError) throw profilesError;

      // Map cars with client information
      const transformedCars = carsData.map(car => {
        const clientProfile = profilesData?.find(profile => profile.user_id === car.client_id);
        return {
          ...car,
          client: clientProfile ? {
            id: clientProfile.user_id,
            first_name: clientProfile.first_name,
            last_name: clientProfile.last_name,
            phone: clientProfile.phone
          } : {
            id: car.client_id || 'unknown',
            first_name: 'Unknown',
            last_name: 'Client',
            phone: 'N/A'
          }
        };
      });
      setCars(transformedCars as CarWithClient[]);
    } catch (error) {
      console.error('Error fetching hosted cars:', error);
      toast({
        title: "Error loading cars",
        description: "Unable to load hosted cars. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCarReturn = async (carId: string) => {
    try {
      // First, update just the status to 'available'
      const {
        error: statusError
      } = await supabase.from('cars').update({
        status: 'available'
      }).eq('id', carId);
      if (statusError) throw statusError;

      // Then, clear the host and client associations
      const {
        error: clearError
      } = await supabase.from('cars').update({
        host_id: null,
        client_id: null
      }).eq('id', carId);
      if (clearError) throw clearError;
      toast({
        title: "Car returned successfully",
        description: "The car has been marked as returned and is now available for new requests."
      });

      // Refresh the list
      fetchHostedCars();
    } catch (error) {
      console.error('Error returning car:', error);
      toast({
        title: "Error",
        description: "Unable to process car return. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('host_expenses')
        .select('*')
        .eq('host_id', user.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchEarnings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('host_earnings')
        .select('*')
        .eq('host_id', user.id)
        .order('earning_period_start', { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchClaims = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('host_claims')
        .select('*')
        .eq('host_id', user.id)
        .order('incident_date', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const onExpenseSubmit = async (values: z.infer<typeof expenseSchema>) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('host_expenses')
        .insert({
          host_id: user.id,
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
        });

      if (error) throw error;

      toast({
        title: "Expense added successfully",
        description: "Your expense has been recorded.",
      });

      setExpenseDialogOpen(false);
      expenseForm.reset();
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onEarningSubmit = async (values: z.infer<typeof earningSchema>) => {
    if (!user) return;

    try {
      const clientProfit = (values.gross_earnings * values.client_profit_percentage) / 100;
      const hostProfit = (values.gross_earnings * values.host_profit_percentage) / 100;
      const commission = values.gross_earnings * 0.1; // 10% commission
      const netAmount = hostProfit - commission;

      const { error } = await (supabase as any)
        .from('host_earnings')
        .insert({
          host_id: user.id,
          car_id: values.car_id,
          guest_name: values.guest_name,
          earning_type: values.earning_type,
          amount: hostProfit,
          gross_earnings: values.gross_earnings,
          commission: commission,
          net_amount: netAmount,
          client_profit_percentage: values.client_profit_percentage,
          host_profit_percentage: values.host_profit_percentage,
          client_profit_amount: clientProfit,
          host_profit_amount: hostProfit,
          payment_source: values.payment_source,
          earning_period_start: values.earning_period_start,
          earning_period_end: values.earning_period_end,
          payment_status: values.payment_status,
          date_paid: values.date_paid || null,
        });

      if (error) throw error;

      toast({
        title: "Earning recorded successfully",
        description: "Your earning has been added to the system.",
      });

      setEarningDialogOpen(false);
      earningForm.reset();
      fetchEarnings();
    } catch (error) {
      console.error('Error adding earning:', error);
      toast({
        title: "Error",
        description: "Failed to add earning. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onClaimSubmit = async (values: z.infer<typeof claimSchema>) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('host_claims')
        .insert({
          host_id: user.id,
          car_id: values.car_id,
          claim_type: values.claim_type,
          description: values.description,
          accident_description: values.accident_description || null,
          claim_amount: values.claim_amount,
          incident_date: values.incident_date,
          adjuster_name: values.adjuster_name || null,
          adjuster_contact: values.adjuster_contact || null,
          autobody_shop_name: values.autobody_shop_name || null,
          shop_contact_info: values.shop_contact_info || null,
          photos_taken: values.photos_taken,
        });

      if (error) throw error;

      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been filed for review.",
      });

      setClaimDialogOpen(false);
      claimForm.reset();
      fetchClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleManagementAction = (action: string, car: CarWithClient) => {
    switch (action) {
      case 'view-details':
        toast({
          title: "Car Details",
          description: `Viewing details for ${car.year} ${car.make} ${car.model}`
        });
        break;
      case 'schedule-maintenance':
        toast({
          title: "Schedule Maintenance",
          description: "Maintenance scheduling feature coming soon!"
        });
        break;
      case 'report-issue':
        toast({
          title: "Report Issue",
          description: "Issue reporting feature coming soon!"
        });
        break;
      case 'message-client':
        toast({
          title: "Message Client",
          description: "Messaging feature coming soon!"
        });
        break;
      case 'full-details':
        // Only navigate if the route exists
        navigate(`/car-details/${car.id}`);
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: "This feature will be available soon!"
        });
    }
  };
  const activeHostedCars = cars.filter(car => car.status === 'hosted');
  const readyForReturnCars = cars.filter(car => car.status === 'ready_for_return');
  if (loading) {
    return <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading hosted cars...</div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Hosted Cars Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage cars you're currently hosting and process returns.
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">
              Active ({activeHostedCars.length})
            </TabsTrigger>
            <TabsTrigger value="returns">
              Returns ({readyForReturnCars.length})
            </TabsTrigger>
            <TabsTrigger value="expenses">
              Expenses ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="earnings">
              Earnings ({earnings.length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              Claims ({claims.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeHostedCars.length === 0 ? <Card>
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cars currently hosted</h3>
                  <p className="text-muted-foreground">
                    Cars you're hosting will appear here.
                  </p>
                </CardContent>
              </Card> : <div className="grid gap-4 md:grid-cols-2">
                {activeHostedCars.map(car => <Card key={car.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {car.year} {car.make} {car.model}
                          </CardTitle>
                          <CardDescription>
                            Location: {car.location}
                          </CardDescription>
                        </div>
                        <Badge variant="default">Hosting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enhanced Car Information */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Color:</span>
                          <p className="font-medium">{car.color || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mileage:</span>
                          <p className="font-medium">{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hosting Since:</span>
                          <p className="font-medium">{new Date(car.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>

                      {/* Client Contact Section */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Client Contact</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Name:</strong> {car.client.first_name} {car.client.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${car.client.phone}`} className="text-sm hover:underline">
                              {car.client.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${car.client.phone}`)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleManagementAction('view-details', car)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Car Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagementAction('schedule-maintenance', car)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Maintenance
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            {readyForReturnCars.length === 0 ? <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cars ready for return</h3>
                  <p className="text-muted-foreground">
                    Cars ready to be returned will appear here.
                  </p>
                </CardContent>
              </Card> : <div className="grid gap-4 md:grid-cols-2">
                {readyForReturnCars.map(car => <Card key={car.id} className="border-orange-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {car.year} {car.make} {car.model}
                          </CardTitle>
                          <CardDescription>
                            Location: {car.location}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Ready for Return</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Client Contact</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Name:</strong> {car.client.first_name} {car.client.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${car.client.phone}`} className="text-sm hover:underline">
                              {car.client.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠ Client has requested car return
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(`tel:${car.client.phone}`)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Client
                          </Button>
                          <Button size="sm" onClick={() => handleCarReturn(car.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Expenses</h3>
              <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                      Record a new hosting-related expense.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...expenseForm}>
                    <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                      <FormField
                        control={expenseForm.control}
                        name="car_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Car</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a car" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cars.map((car) => (
                                  <SelectItem key={car.id} value={car.id}>
                                    {car.year} {car.make} {car.model}
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
                            <FormLabel>Guest Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter guest name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Cost Breakdown</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={expenseForm.control}
                            name="ev_charge_cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>EV Charge Cost</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                              <Textarea placeholder="Describe the expense..." {...field} />
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
                      <DialogFooter>
                        <Button type="submit">Add Expense</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {expenses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No expenses recorded</h3>
                  <p className="text-muted-foreground">
                    Start tracking your hosting expenses.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {expenses.map((expense) => (
                  <Card key={expense.id}>
                     <CardContent className="p-4">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-medium capitalize">{expense.expense_type}</h4>
                           {expense.guest_name && (
                             <p className="text-sm text-muted-foreground">Guest: {expense.guest_name}</p>
                           )}
                           <p className="text-sm text-muted-foreground">{expense.description}</p>
                           <p className="text-sm text-muted-foreground">
                             {new Date(expense.expense_date).toLocaleDateString()}
                           </p>
                           
                           {/* Cost Breakdown */}
                           <div className="mt-2 space-y-1">
                             {expense.ev_charge_cost > 0 && (
                               <div className="flex justify-between text-sm">
                                 <span>EV Charge:</span>
                                 <span>${expense.ev_charge_cost.toFixed(2)}</span>
                               </div>
                             )}
                             {expense.carwash_cost > 0 && (
                               <div className="flex justify-between text-sm">
                                 <span>Carwash:</span>
                                 <span>${expense.carwash_cost.toFixed(2)}</span>
                               </div>
                             )}
                             {expense.delivery_cost > 0 && (
                               <div className="flex justify-between text-sm">
                                 <span>Delivery:</span>
                                 <span>${expense.delivery_cost.toFixed(2)}</span>
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
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-lg">
                             ${expense.total_expenses?.toFixed(2) || expense.amount.toFixed(2)}
                           </p>
                           <p className="text-xs text-muted-foreground">Total</p>
                         </div>
                       </div>
                     </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Earnings</h3>
              <Dialog open={earningDialogOpen} onOpenChange={setEarningDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Earning
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Earning</DialogTitle>
                    <DialogDescription>
                      Add a new earning record from your hosting activities.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...earningForm}>
                    <form onSubmit={earningForm.handleSubmit(onEarningSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={earningForm.control}
                          name="car_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Car</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a car" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cars.map((car) => (
                                    <SelectItem key={car.id} value={car.id}>
                                      {car.year} {car.make} {car.model}
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
                              <FormLabel>Guest Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter guest name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={earningForm.control}
                          name="earning_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Earning Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select earning type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hosting">Hosting</SelectItem>
                                  <SelectItem value="delivery">Delivery</SelectItem>
                                  <SelectItem value="subscription">Subscription</SelectItem>
                                  <SelectItem value="bonus">Bonus</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment source" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Turo">Turo</SelectItem>
                                  <SelectItem value="Eon">Eon</SelectItem>
                                  <SelectItem value="GetAround">GetAround</SelectItem>
                                  <SelectItem value="Private">Private</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
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
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={earningForm.control}
                          name="client_profit_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Profit %</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="30"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 30)}
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
                                  step="1"
                                  placeholder="70"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 70)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={earningForm.control}
                          name="earning_period_start"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period Start</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={earningForm.control}
                          name="earning_period_end"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period End</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={earningForm.control}
                          name="payment_status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
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
                              <FormLabel>Date Paid (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit">Record Earning</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {earnings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No earnings recorded</h3>
                  <p className="text-muted-foreground">
                    Start tracking your hosting earnings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Earnings</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${earnings.reduce((sum, e) => sum + e.net_amount, 0).toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pending Payments</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            ${earnings.filter(e => e.payment_status === 'pending').reduce((sum, e) => sum + e.net_amount, 0).toFixed(2)}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${earnings.filter(e => new Date(e.earning_period_start).getMonth() === new Date().getMonth())
                              .reduce((sum, e) => sum + e.net_amount, 0).toFixed(2)}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Earnings List */}
                <div className="grid gap-4">
                  {earnings.map((earning) => (
                    <Card key={earning.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium capitalize">{earning.earning_type}</h4>
                              <Badge variant={earning.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {earning.payment_status}
                              </Badge>
                            </div>
                            {earning.guest_name && (
                              <p className="text-sm text-muted-foreground">Guest: {earning.guest_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {new Date(earning.earning_period_start).toLocaleDateString()} - {new Date(earning.earning_period_end).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Source: {earning.payment_source}
                            </p>
                            
                            {/* Profit Breakdown */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Gross Earnings:</span>
                                <p className="font-medium">${earning.gross_earnings?.toFixed(2) || '0.00'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Commission:</span>
                                <p className="font-medium">${earning.commission.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Client Profit ({earning.client_profit_percentage}%):</span>
                                <p className="font-medium">${earning.client_profit_amount?.toFixed(2) || '0.00'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Host Profit ({earning.host_profit_percentage}%):</span>
                                <p className="font-medium">${earning.host_profit_amount?.toFixed(2) || '0.00'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-green-600">${earning.net_amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Net Amount</p>
                            {earning.date_paid && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Paid: {new Date(earning.date_paid).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Claims</h3>
              <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    File Claim
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>File New Claim</DialogTitle>
                    <DialogDescription>
                      Submit a claim for damages or incidents.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...claimForm}>
                    <form onSubmit={claimForm.handleSubmit(onClaimSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={claimForm.control}
                          name="car_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Car</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a car" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cars.map((car) => (
                                    <SelectItem key={car.id} value={car.id}>
                                      {car.year} {car.make} {car.model}
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
                              <FormLabel>Claim Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select claim type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="damage">Physical Damage</SelectItem>
                                  <SelectItem value="theft">Theft</SelectItem>
                                  <SelectItem value="accident">Accident</SelectItem>
                                  <SelectItem value="vandalism">Vandalism</SelectItem>
                                  <SelectItem value="mechanical">Mechanical Issues</SelectItem>
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
                              <Textarea placeholder="Describe what happened..." {...field} />
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
                            <FormLabel>Detailed Accident Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Provide additional details about the accident..." {...field} />
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
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h4 className="font-medium">Insurance & Repair Information</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={claimForm.control}
                            name="adjuster_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adjuster Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter adjuster name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={claimForm.control}
                            name="adjuster_contact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adjuster Contact (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone or email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={claimForm.control}
                            name="autobody_shop_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Auto Body Shop (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Shop name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={claimForm.control}
                            name="shop_contact_info"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shop Contact (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone or address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

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
                                <FormLabel>Photos taken of damage/incident</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit">Submit Claim</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {claims.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No claims filed</h3>
                  <p className="text-muted-foreground">
                    File claims for damages or incidents here.
                  </p>
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
                          <p className="text-sm text-muted-foreground">Total Claims</p>
                          <p className="text-2xl font-bold">{claims.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {claims.filter(c => c.claim_status === 'pending').length}
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
                          <p className="text-sm text-muted-foreground">Approved</p>
                          <p className="text-2xl font-bold text-green-600">
                            {claims.filter(c => c.claim_status === 'approved').length}
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
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-2xl font-bold">
                            ${claims.reduce((sum, c) => sum + (c.claim_amount || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Claims List */}
                <div className="grid gap-4">
                  {claims.map((claim) => (
                    <Card key={claim.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium capitalize">{claim.claim_type} Claim</h4>
                              <Badge variant={
                                claim.claim_status === 'approved' ? 'default' :
                                claim.claim_status === 'denied' ? 'destructive' : 'secondary'
                              }>
                                {claim.claim_status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{claim.description}</p>
                            {claim.accident_description && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Details:</strong> {claim.accident_description}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              <strong>Incident Date:</strong> {new Date(claim.incident_date).toLocaleDateString()}
                            </p>
                            
                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {claim.adjuster_name && (
                                <div>
                                  <span className="text-muted-foreground">Adjuster:</span>
                                  <p className="font-medium">{claim.adjuster_name}</p>
                                  {claim.adjuster_contact && (
                                    <p className="text-xs text-muted-foreground">{claim.adjuster_contact}</p>
                                  )}
                                </div>
                              )}
                              {claim.autobody_shop_name && (
                                <div>
                                  <span className="text-muted-foreground">Repair Shop:</span>
                                  <p className="font-medium">{claim.autobody_shop_name}</p>
                                  {claim.shop_contact_info && (
                                    <p className="text-xs text-muted-foreground">{claim.shop_contact_info}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {claim.photos_taken && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Photos documented</span>
                              </div>
                            )}

                            {/* Progress Indicators */}
                            {claim.claim_status !== 'pending' && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Filed: {new Date(claim.created_at).toLocaleDateString()}</span>
                                {claim.approval_date && (
                                  <span>• Approved: {new Date(claim.approval_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${claim.claim_amount?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-muted-foreground">Claimed</p>
                            {claim.approved_amount && (
                              <div className="mt-1">
                                <p className="text-sm font-medium text-green-600">
                                  ${claim.approved_amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">Approved</p>
                              </div>
                            )}
                            {claim.payout_amount && (
                              <div className="mt-1">
                                <p className="text-sm font-medium text-blue-600">
                                  ${claim.payout_amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">Paid Out</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
}