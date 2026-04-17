import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Phone, Mail, User, Calendar, Car } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClientProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string;
  created_at: string;
  has_cars: boolean;
  car_count: number;
  hosted_car_count: number;
}

export default function RegisteredClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_clients_for_hosts");

      if (error) throw error;

      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter((client) => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase();
      const email = (client.email || "").toLowerCase();
      const phone = client.phone.toLowerCase();
      const company = (client.company_name || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        company.includes(query)
      );
    });

    setFilteredClients(filtered);
  };

  const getClientStatus = (client: ClientProfile) => {
    if (client.hosted_car_count > 0) {
      return { label: "Active", variant: "default" as const };
    }
    if (client.car_count > 0) {
      return { label: "Has Cars", variant: "secondary" as const };
    }
    return { label: "No Cars Yet", variant: "outline" as const };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registered Clients</h1>
            <p className="text-muted-foreground mt-2">
              View and connect with Tesla owners in the Teslys network
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {searchQuery ? "No clients found matching your search" : "No clients registered yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => {
                const status = getClientStatus(client);
                return (
                  <Card key={client.user_id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">
                            {client.first_name && client.last_name
                              ? `${client.first_name} ${client.last_name}`
                              : client.first_name || client.last_name || "Unnamed Client"}
                          </CardTitle>
                          {client.company_name && (
                            <CardDescription className="text-base">
                              {client.company_name}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`mailto:${client.email}`}
                              className="hover:underline text-primary"
                            >
                              {client.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`tel:${client.phone}`}
                              className="hover:underline text-primary"
                            >
                              {client.phone}
                            </a>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {client.car_count} car{client.car_count !== 1 ? "s" : ""} registered
                              {client.hosted_car_count > 0 && (
                                <span className="ml-1">
                                  ({client.hosted_car_count} with you)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Joined {format(new Date(client.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!client.has_cars && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            💡 This client hasn't added any cars yet. Consider reaching out to help
                            them get started with Teslys.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredClients.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
