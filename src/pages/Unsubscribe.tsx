import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [subscription, setSubscription] = useState<{
    email: string;
    is_active: boolean;
    unsubscribed_at: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing unsubscribe token");
      setLoading(false);
      return;
    }

    fetchSubscriptionInfo();
  }, [token]);

  const fetchSubscriptionInfo = async () => {
    try {
      // Call edge function with token in URL
      const response = await fetch(
        `https://texsltzecmvqprdjxtnh.supabase.co/functions/v1/newsletter-unsubscribe?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      setError("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;

    setUnsubscribing(true);
    setError(null);

    try {
      const response = await fetch(
        `https://texsltzecmvqprdjxtnh.supabase.co/functions/v1/newsletter-unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setSuccess(true);
      setSubscription((prev) => prev ? { ...prev, is_active: false } : null);
    } catch (err: any) {
      console.error("Error unsubscribing:", err);
      setError("Failed to unsubscribe. Please try again.");
    } finally {
      setUnsubscribing(false);
    }
  };

  return (
    <>
      <SEO
        title="Unsubscribe from Newsletter"
        description="Manage your Teslys newsletter subscription preferences"
      />
      
      <DashboardLayout>
        <PageContainer>
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="w-12 h-12 text-muted-foreground" />
                </div>
                <CardTitle>Newsletter Subscription</CardTitle>
                <CardDescription>
                  {loading
                    ? "Loading subscription information..."
                    : subscription?.is_active
                    ? "Manage your newsletter preferences"
                    : "Subscription Status"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {loading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!loading && !error && subscription && (
                  <>
                    {success || !subscription.is_active ? (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Successfully Unsubscribed
                          </h3>
                          <p className="text-muted-foreground">
                            {subscription.email} has been unsubscribed from the Teslys newsletter.
                          </p>
                          {subscription.unsubscribed_at && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Unsubscribed on{" "}
                              {new Date(subscription.unsubscribed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You won't receive any more emails from us. We're sorry to see you go!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-4">
                            Currently subscribed: <strong>{subscription.email}</strong>
                          </p>
                          <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to unsubscribe from the Teslys newsletter?
                            You'll miss out on Tesla car sharing tips, passive income strategies,
                            and exclusive updates.
                          </p>
                        </div>

                        <Button
                          onClick={handleUnsubscribe}
                          disabled={unsubscribing}
                          variant="destructive"
                          className="w-full"
                        >
                          {unsubscribing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Unsubscribing...
                            </>
                          ) : (
                            "Unsubscribe from Newsletter"
                          )}
                        </Button>

                        <div className="text-center">
                          <a
                            href="/"
                            className="text-sm text-primary hover:underline"
                          >
                            Return to Teslys
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
