import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Wrench, Car, ChevronLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const maintenanceSchema = z.object({
  maintenance_type: z.string().min(1, 'Maintenance type is required'),
  scheduled_date: z.date({
    required_error: 'Scheduled date is required',
  }),
  scheduled_time: z.string().optional(),
  provider_name: z.string().optional(),
  provider_contact: z.string().optional(),
  estimated_cost: z.number().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const maintenanceTypes = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Engine Tune-up',
  'Car Wash',
  'Interior Cleaning',
  'Battery Check',
  'Fluid Check',
  'Other'
];

export default function ScheduleMaintenance() {
  const { id: carId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenance_type: '',
      notes: '',
      provider_name: '',
      provider_contact: '',
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!user || !carId) {
      toast({
        title: "Error",
        description: "You must be logged in to schedule maintenance",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .insert({
          car_id: carId,
          host_id: user.id,
          maintenance_type: data.maintenance_type,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time: data.scheduled_time || null,
          provider_name: data.provider_name || null,
          provider_contact: data.provider_contact || null,
          estimated_cost: data.estimated_cost || null,
          notes: data.notes || null,
          status: 'scheduled',
        });

      if (error) {
        throw error;
      }

      // Send notification to client
      try {
        await supabase.functions.invoke('send-maintenance-notification', {
          body: {
            carId: carId,
            maintenanceType: data.maintenance_type,
            scheduledDate: format(data.scheduled_date, 'yyyy-MM-dd'),
            scheduledTime: data.scheduled_time,
            provider: data.provider_name || 'TBD',
            estimatedCost: data.estimated_cost,
            notes: data.notes
          }
        });
      } catch (emailError) {
        console.error('Error sending maintenance notification:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Success",
        description: "Maintenance has been scheduled and client notified successfully",
      });

      navigate('/my-cars');
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
		      <header className="sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-12 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/my-cars')}
            aria-label="Back"
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-bold">Schedule Maintenance</h1>
          </div>

          {/* spacer to keep title centered */}
          <div className="h-9 w-9" />
        </div>
      </header>

      <div className="space-y-6">

				<section className="mb-6">
				  {/* Desktop / tablet (md+): full header with info + reset */}
				  <div className="hidden md:flex items-center justify-between gap-3">
					<div>
					  <div className="flex items-center gap-2">
						<Wrench className="h-6 w-6 text-primary" />
					  </div>
					  <p className="text-muted-foreground">
              Schedule routine maintenance or repairs for your vehicle
					  </p>
					</div>
		
				  </div>
		
				  {/* Mobile (sm and below): compact banner */}
				  <div className="md:hidden">
					<div className="rounded-2xl   p-3 flex items-start gap-3">
					  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
						<Wrench className="h-5 w-5 text-primary" />
					  </div>
					  <div className="flex-1">
						<p className="text-sm text-muted-foreground leading-relaxed">
              Schedule routine maintenance or repairs for your vehicle
						</p>
					  </div>
					</div>
				  </div>
				</section>
		

        <Card className="max-w-2xl px-4">
          <CardContent className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="maintenance_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select maintenance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Scheduled Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Scheduled Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="scheduled_time"
                        type="time"
                        className="pl-10"
                        {...form.register('scheduled_time')}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider_name">Service Provider</Label>
                    <Input
                      id="provider_name"
                      placeholder="e.g., Joe's Auto Shop"
                      {...form.register('provider_name')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider_contact">Provider Contact</Label>
                    <Input
                      id="provider_contact"
                      placeholder="Phone or email"
                      {...form.register('provider_contact')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('estimated_cost', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details about the maintenance..."
                    rows={3}
                    {...form.register('notes')}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-cars')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}