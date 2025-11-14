import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Shield,
  Mail,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface DeliverabilityMetrics {
  date: string;
  delivery_rate: number;
  bounce_rate: number;
  spam_rate: number;
  open_rate: number;
  click_rate: number;
  total_sent: number;
}

interface DNSRecord {
  record_type: string;
  status: string;
  expected_value: string;
  actual_value: string | null;
  error_message: string | null;
  last_checked_at: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  category: string;
  is_resolved: boolean;
}

export default function AdminEmailDeliverability() {
  const [metrics, setMetrics] = useState<DeliverabilityMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<DeliverabilityMetrics | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingDNS, setValidatingDNS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch metrics for the last 30 days
      const { data: metricsData } = await supabase
        .from("email_deliverability_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

      if (metricsData) {
        setMetrics(metricsData.reverse());
        setCurrentMetrics(metricsData[0] || null);
      }

      // Fetch DNS records
      const { data: dnsData } = await supabase
        .from("dns_records_validation")
        .select("*")
        .order("record_type");

      if (dnsData) {
        setDnsRecords(dnsData);
      }

      // Fetch recommendations
      const { data: recsData } = await supabase
        .from("deliverability_recommendations")
        .select("*")
        .eq("is_resolved", false)
        .order("severity", { ascending: true });

      if (recsData) {
        setRecommendations(recsData as Recommendation[]);
      }
    } catch (error) {
      console.error("Error fetching deliverability data:", error);
      toast({
        title: "Error",
        description: "Failed to load deliverability data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDNS = async () => {
    setValidatingDNS(true);
    try {
      const { error } = await supabase.functions.invoke("validate-dns-records");
      
      if (error) throw error;

      toast({
        title: "DNS Validation Complete",
        description: "DNS records have been validated successfully"
      });
      
      fetchData();
    } catch (error) {
      console.error("Error validating DNS:", error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate DNS records",
        variant: "destructive"
      });
    } finally {
      setValidatingDNS(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "invalid":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      warning: "default",
      info: "secondary"
    } as const;
    return <Badge variant={variants[severity as keyof typeof variants]}>{severity}</Badge>;
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Email Deliverability</h1>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email Deliverability</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and optimize your email performance
        </p>
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dns">DNS Validation</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics?.delivery_rate?.toFixed(2) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentMetrics?.delivery_rate >= 95 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" /> Excellent
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <TrendingDown className="h-3 w-3" /> Needs improvement
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics?.bounce_rate?.toFixed(2) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentMetrics?.bounce_rate <= 2 ? (
                    <span className="text-green-600">Within target (&lt;2%)</span>
                  ) : (
                    <span className="text-red-600">Above target</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spam Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics?.spam_rate?.toFixed(3) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentMetrics?.spam_rate <= 0.1 ? (
                    <span className="text-green-600">Excellent (&lt;0.1%)</span>
                  ) : (
                    <span className="text-red-600">Review content</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics?.open_rate?.toFixed(2) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentMetrics?.open_rate >= 20 ? (
                    <span className="text-green-600">Above industry average</span>
                  ) : (
                    <span className="text-yellow-600">Below average (20%)</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverability Trends (30 Days)</CardTitle>
              <CardDescription>
                Track delivery, bounce, and spam rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="delivery_rate" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Delivery Rate %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="open_rate" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    name="Open Rate %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bounce_rate" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Bounce Rate %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">DNS Authentication Records</h3>
              <p className="text-sm text-muted-foreground">
                Verify your email authentication setup
              </p>
            </div>
            <Button onClick={validateDNS} disabled={validatingDNS}>
              <RefreshCw className={`mr-2 h-4 w-4 ${validatingDNS ? 'animate-spin' : ''}`} />
              Validate DNS
            </Button>
          </div>

          <div className="grid gap-4">
            {dnsRecords.map((record) => (
              <Card key={record.record_type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <CardTitle className="text-base">{record.record_type}</CardTitle>
                        <CardDescription className="text-xs">
                          Last checked: {new Date(record.last_checked_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={record.status === "valid" ? "default" : "destructive"}>
                      {record.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Expected Value:</p>
                    <code className="block p-2 bg-muted rounded text-xs break-all">
                      {record.expected_value}
                    </code>
                  </div>
                  {record.actual_value && (
                    <div>
                      <p className="text-sm font-medium mb-1">Actual Value:</p>
                      <code className="block p-2 bg-muted rounded text-xs break-all">
                        {record.actual_value}
                      </code>
                    </div>
                  )}
                  {record.error_message && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Configuration Error</AlertTitle>
                      <AlertDescription>{record.error_message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Deliverability Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Automated suggestions to improve your email performance
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">All Good!</p>
                <p className="text-sm text-muted-foreground">
                  No outstanding deliverability issues detected
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Alert key={rec.id} variant={rec.severity === "critical" ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {rec.title}
                        {getSeverityBadge(rec.severity)}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {rec.description}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        Category: {rec.category}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
