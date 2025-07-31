import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, CheckCircle, XCircle, Settings, Calendar, FileText, AlertTriangle, DollarSign, Plus, Edit, Trash } from 'lucide-react';
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
  expense_type: string;
  amount: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Earning {
  id: string;
  host_id: string;
  car_id: string;
  earning_type: string;
  amount: number;
  commission: number;
  net_amount: number;
  earning_period_start: string;
  earning_period_end: string;
  payment_status: string;
  payment_date: string | null;
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
  created_at: string;
  updated_at: string;
}

const expenseSchema = z.object({
  car_id: z.string().optional(),
  expense_type: z.string().min(1, "Expense type is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  expense_date: z.string().min(1, "Date is required"),
});

const claimSchema = z.object({
  car_id: z.string().min(1, "Car is required"),
  claim_type: z.string().min(1, "Claim type is required"),
  description: z.string().min(1, "Description is required"),
  claim_amount: z.number().min(0.01, "Amount must be greater than 0"),
  incident_date: z.string().min(1, "Incident date is required"),
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
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_type: "",
      amount: 0,
      description: "",
      expense_date: new Date().toISOString().split('T')[0],
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
          expense_type: values.expense_type,
          amount: values.amount,
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
          claim_amount: values.claim_amount,
          incident_date: values.incident_date,
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
                            <FormLabel>Car (Optional)</FormLabel>
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
                        name="expense_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expense type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fuel">Fuel</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="repairs">Repairs</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={expenseForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
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
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <h3 className="text-lg font-medium">Earnings</h3>
            
            {earnings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No earnings recorded</h3>
                  <p className="text-muted-foreground">
                    Your hosting earnings will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {earnings.map((earning) => (
                  <Card key={earning.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium capitalize">{earning.earning_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(earning.earning_period_start).toLocaleDateString()} - {new Date(earning.earning_period_end).toLocaleDateString()}
                          </p>
                          <Badge variant={earning.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {earning.payment_status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">${earning.net_amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            Gross: ${earning.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                                <SelectItem value="damage">Damage</SelectItem>
                                <SelectItem value="theft">Theft</SelectItem>
                                <SelectItem value="accident">Accident</SelectItem>
                                <SelectItem value="vandalism">Vandalism</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={claimForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the incident..." {...field} />
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
                            <FormLabel>Claim Amount</FormLabel>
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
              <div className="grid gap-4">
                {claims.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium capitalize">{claim.claim_type}</h4>
                          <p className="text-sm text-muted-foreground">{claim.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Incident: {new Date(claim.incident_date).toLocaleDateString()}
                          </p>
                          <Badge variant={
                            claim.claim_status === 'approved' ? 'default' :
                            claim.claim_status === 'denied' ? 'destructive' : 'secondary'
                          }>
                            {claim.claim_status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${claim.claim_amount?.toFixed(2) || '0.00'}</p>
                          {claim.approved_amount && (
                            <p className="text-sm text-green-600">
                              Approved: ${claim.approved_amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
}