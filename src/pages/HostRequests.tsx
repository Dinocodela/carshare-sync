import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Car, User, Info, ChevronLeft } from 'lucide-react';

interface RequestWithDetails {
  id: string;
  car_id: string;
  client_id: string;
  host_id: string;
  message: string;
  status: string;
  created_at: string;
  car: {
    make: string;
    model: string;
    year: number;
    color: string;
    images: string[];
  } | null;
  client: {
    first_name: string;
    last_name: string;
  };
}

export default function HostRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user is a host
    const checkHostRole = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error || profile?.role !== 'host') {
        toast({
          title: "Access Denied",
          description: "Only hosts can access this page.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      fetchRequests();
    };
    
    checkHostRole();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      // First get requests for this host
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          cars(make, model, year, color, images)
        `)
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Then get client profiles for each request and filter out invalid data
      const requestsWithClientData = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: clientData, error: clientError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', request.client_id)
            .single();

          return {
            ...request,
            car: request.cars || null,
            client: clientData || { first_name: 'Unknown', last_name: 'Client' }
          };
        })
      );

      // Filter out requests with missing car data to prevent errors
      const validRequests = requestsWithClientData.filter(request => {
        if (!request.car) {
          console.warn('Request with missing car data filtered out:', request.id);
          return false;
        }
        return true;
      });

      setRequests(validRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    console.log(`Starting ${action} action for request:`, requestId);
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error('Request not found:', requestId);
        throw new Error('Request not found');
      }

      console.log('Found request:', request);

      // Update request status
      console.log(`Updating request status to ${action}...`);
      const { error: requestError } = await supabase
        .from('requests')
        .update({ status: action })
        .eq('id', requestId);

      if (requestError) {
        console.error('Error updating request:', requestError);
        throw requestError;
      }

      console.log('Request status updated successfully');

      // Update car status and host_id
      const newCarStatus = action === 'accepted' ? 'hosted' : 'available';
      const updateData = action === 'accepted' 
        ? { status: newCarStatus, host_id: user?.id } 
        : { status: newCarStatus, host_id: null };
      console.log(`Updating car status to ${newCarStatus} and host_id...`);
      const { error: carError } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', request.car_id);

      if (carError) {
        console.error('Error updating car status:', carError);
        throw carError;
      }

      console.log('Car status updated successfully');

      // Get host profile information for contact details
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, company_name, phone')
        .eq('user_id', user?.id)
        .single();

      // Send client confirmation email
      const emailData = {
        requestId: requestId,
        clientId: request.client_id,
        clientName: `${request.client.first_name} ${request.client.last_name}`,
        hostName: hostProfile ? `${hostProfile.first_name} ${hostProfile.last_name}` : "Teslys Team",
        hostCompany: hostProfile?.company_name || "Teslys LLC",
        hostPhone: hostProfile?.phone,
        hostEmail: user?.email,
        carDetails: request.car ? `${request.car.year} ${request.car.make} ${request.car.model}` : 'Vehicle details unavailable',
        status: action
      };

      console.log('Sending client confirmation email...');
      const { error: emailError } = await supabase.functions.invoke('send-client-confirmation', {
        body: emailData
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw - email failure shouldn't block the main action
      } else {
        console.log('Email sent successfully');
      }

      // Refresh requests
      console.log('Refreshing requests...');
      await fetchRequests();

      toast({
        title: "Success",
        description: `Request ${action} successfully`,
      });

      console.log(`${action} action completed successfully`);

    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action === 'accepted' ? 'accept' : 'decline'} request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading requests...</div>
        </div>
      </DashboardLayout>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <DashboardLayout>
			  <header className="sticky top-0 z-10">
				<div className="mx-auto max-w-2xl px-4 h-12 flex items-center justify-between">
				  <Button
					variant="ghost"
					size="icon"
					onClick={() => navigate(-1)}
					aria-label="Back"
					className="h-9 w-9"
				  >
					<ChevronLeft className="h-5 w-5" />
				  </Button>
		
				  <div className="flex items-center gap-2">
					<h1 className=" text-xl sm:text-2xl font-bold">Host Requests</h1>
				  </div>
		
				  {/* spacer to keep title centered */}
				  <div className="h-9 w-9" />
				</div>
			  </header>


			<section className="mb-6 px-4">
			  {/* Desktop / tablet (md+): full header with info + reset */}
			  <div className="hidden md:flex items-center justify-between gap-3">
				<div>
				  <div className="flex items-center gap-2">
					<Info className="h-6 w-6 text-primary" />
				  </div>
				  <p className="text-muted-foreground">
Review and manage incoming vehicle hosting requests				  </p>
				</div>
	
			  </div>
	
			  {/* Mobile (sm and below): compact banner */}
			  <div className="md:hidden">
				<div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
				  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
					<Info className="h-5 w-5 text-primary" />
				  </div>
				  <div className="flex-1">
					<p className="text-sm text-muted-foreground leading-relaxed">
Review and manage incoming vehicle hosting requests					</p>
				  </div>
				</div>
			  </div>
			</section>
	

      <div className="space-y-6">

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">You don't have any pending hosting requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {request.car ? `${request.car.year} ${request.car.make} ${request.car.model}` : 'Vehicle details unavailable'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {request.client.first_name} {request.client.last_name}
                        <Badge variant="outline" className="ml-2">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    {request.car?.images?.[0] && (
                      <img 
                        src={request.car.images[0]} 
                        alt={request.car ? `${request.car.make} ${request.car.model}` : 'Vehicle'}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Car Details:</p>
                      <p className="text-sm">Color: {request.car?.color || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {request.message && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Client Message:</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{request.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestAction(request.id, 'accepted')}
                      disabled={processingRequests.has(request.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingRequests.has(request.id) ? 'Processing...' : 'Accept Request'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRequestAction(request.id, 'rejected')}
                      disabled={processingRequests.has(request.id)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingRequests.has(request.id) ? 'Processing...' : 'Decline Request'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {requests.filter(req => req.status !== 'pending').length > 0 && (
          <div className="space-y-4">
            {/* <h2 className="text-xl font-semibold">Request History</h2> */}
            {requests.filter(req => req.status !== 'pending').map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Car className="h-4 w-4" />
                        {request.car ? `${request.car.year} ${request.car.make} ${request.car.model}` : 'Vehicle details unavailable'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {request.client.first_name} {request.client.last_name}
                        <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'} className="ml-2">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}